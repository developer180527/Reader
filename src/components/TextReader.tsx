import React, { useState, useEffect, useRef } from 'react';
import { PageFlipper } from './PageFlipper';
import { useWindowSize } from 'react-use';

interface TextReaderProps {
  text: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  onProgress?: (progress: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  fontSize: number;
}

export function TextReader({ text, initialPage, onPageChange, onProgress, theme, fontSize }: TextReaderProps) {
  const [totalPages, setTotalPages] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  
  const isLandscape = width > height && width >= 640;
  const columnWidth = isLandscape ? width / 2 : width;

  const pad = isLandscape ? 64 : 16; // horizontal padding
  const topPad = isLandscape ? 48 : 32; // vertical padding
  const innerColWidth = columnWidth - pad * 2;

  useEffect(() => {
    // Measure total pages when layout or font size changes
    if (containerRef.current) {
       const el = containerRef.current;
       const pages = Math.ceil(el.scrollWidth / innerColWidth);
       setTotalPages(Math.max(1, pages));
    }
  }, [width, height, fontSize, text, innerColWidth]);

  useEffect(() => {
    if (totalPages > 0 && onProgress) {
      const progress = totalPages > 1 ? initialPage / (totalPages - 1) : 1;
      onProgress(progress);
    }
  }, [initialPage, totalPages, onProgress]);

  // A hidden container to measure the flowed text
  const hiddenStyle: React.CSSProperties = {
    position: 'absolute',
    top: -9999,
    left: -9999,
    visibility: 'hidden',
    columnWidth: `${innerColWidth}px`,
    columnGap: `${pad * 2}px`,
    height: `calc(100% - ${topPad * 2}px)`,
    fontSize: `${fontSize}px`,
    lineHeight: 1.8,
    fontFamily: 'serif',
    textAlign: 'justify',
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia': return 'bg-[#E8DCC4] text-[#5b4636] border-[#d4c5ab]';
      case 'dark': return 'bg-[#1C1C1C] text-gray-300 border-black/20';
      default: return 'bg-[#F5F2ED] text-black border-black/10';
    }
  };

  const renderTextPage = (index: number) => {
    const themeClasses = getThemeClasses();
    
    return (
      <article className={`w-full h-full flex flex-col overflow-hidden relative ${themeClasses} ${isLandscape ? 'border-r' : ''}`}>
         <div 
           className="absolute"
           style={{
             top: topPad,
             bottom: topPad,
             left: pad,
             width: innerColWidth,
             columnWidth: `${innerColWidth}px`,
             columnGap: `${pad*2}px`,
             fontSize: `${fontSize}px`,
             lineHeight: 1.8,
             fontFamily: 'serif',
             textAlign: 'justify',
             // Shift left to reveal column `index`
             // Since columnGap is pad*2, the distance between column centers is innerColWidth + pad*2
             transform: `translateX(-${index * (innerColWidth + pad*2)}px)`,
           }}
         >
            {/* The raw text, styled nicely. */}
           {text.split('\n\n').map((p, i) => (
             <p key={i} className="mb-6 indent-8">{p}</p>
           ))}
         </div>
         
         <footer className="absolute bottom-4 left-0 right-0 flex justify-center pb-[env(safe-area-inset-bottom)]">
            <span className={`text-xs font-mono opacity-30 ${theme === 'dark' ? 'text-gray-400' : 'text-current'}`}>
              {index + 1}
            </span>
         </footer>
      </article>
    );
  };

  return (
    <main className="w-full h-full flex items-center justify-center bg-[#0F0F0F] relative">
      <div className="flex w-full h-full relative overflow-hidden">
        {/* Spine overlays (visible in landscape only) */}
        {isLandscape && (
          <>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/20 via-transparent to-black/20 z-30"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-40"></div>
          </>
        )}
        
        <div ref={containerRef} style={hiddenStyle}>
          {text.split('\n\n').map((p, i) => <p key={i} className="mb-4 indent-6">{p}</p>)}
        </div>
        
        {totalPages > 0 && (
          <PageFlipper
            currentPage={initialPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            renderPage={renderTextPage}
          />
        )}
      </div>
    </main>
  );
}
