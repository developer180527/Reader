import React, { useState, useEffect, useRef } from 'react';
import { PageFlipper } from './PageFlipper';
import { useWindowSize } from 'react-use';

interface TextReaderProps {
  text: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  fontSize: number;
}

export function TextReader({ text, initialPage, onPageChange, theme, fontSize }: TextReaderProps) {
  const [totalPages, setTotalPages] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  
  const isLandscape = width >= 768;
  const columnWidth = isLandscape ? width / 2 : width;

  useEffect(() => {
    // Measure total pages when layout or font size changes
    if (containerRef.current) {
       // We force a layout calculation
       const el = containerRef.current;
       // Total pages = total width / columnWidth
       const pages = Math.ceil(el.scrollWidth / columnWidth);
       setTotalPages(Math.max(1, pages));
    }
  }, [width, height, fontSize, text, columnWidth]);

  // A hidden container to measure the flowed text
  // We place it offscreen.
  const hiddenStyle: React.CSSProperties = {
    position: 'absolute',
    top: -9999,
    left: -9999,
    visibility: 'hidden',
    columnWidth: `${columnWidth}px`,
    columnGap: '0px',
    height: `${height - 80}px`, // Leaving some margin for top/bottom
    fontSize: `${fontSize}px`,
    lineHeight: 1.6,
    fontFamily: 'serif', // standard book font
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia': return 'bg-[#E8DCC4] text-[#5b4636] border-[#d4c5ab]';
      case 'dark': return 'bg-[#1C1C1C] text-gray-300 border-black/20';
      default: return 'bg-[#F5F2ED] text-black border-black/10';
    }
  };

  const renderTextPage = (index: number) => {
    const pad = isLandscape ? 64 : 32; // padding per side
    const innerColWidth = columnWidth - pad * 2;
    const themeClasses = getThemeClasses();
    
    return (
      <article className={`w-full h-full flex flex-col overflow-hidden relative ${themeClasses} ${isLandscape ? 'border-r' : ''}`}>
         <div 
           className="absolute top-12 bottom-12"
           style={{
             left: pad,
             width: innerColWidth,
             columnWidth: `${innerColWidth}px`,
             columnGap: `${pad*2}px`,
             height: `calc(100% - 96px)`,
             fontSize: `${fontSize}px`,
             lineHeight: 1.8,
             fontFamily: 'serif',
             textAlign: 'justify',
             // Shift left to reveal column `index`
             transform: `translateX(-${index * (innerColWidth + pad*2)}px)`,
           }}
         >
            {/* The raw text, styled nicely. */}
           {text.split('\n\n').map((p, i) => (
             <p key={i} className="mb-6 indent-8">{p}</p>
           ))}
         </div>
         
         <footer className="absolute bottom-6 left-0 right-0 flex justify-center">
            <span className={`text-xs font-mono opacity-30 ${theme === 'dark' ? 'text-gray-400' : 'text-current'}`}>
              {index + 1}
            </span>
         </footer>
      </article>
    );
  };

  return (
    <main className="w-full h-full flex items-center justify-center bg-[#0F0F0F] relative sm:px-12 sm:py-24">
      <div className="flex w-full h-full max-w-6xl shadow-2xl relative overflow-hidden sm:rounded-lg">
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
