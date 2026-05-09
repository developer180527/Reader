import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { PageFlipper } from './PageFlipper';
import { useWindowSize } from 'react-use';
import '../lib/pdfWorker'; // Ensure worker is initialized
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFReaderProps {
  fileData: ArrayBuffer;
  initialPage: number;
  onPageChange: (page: number) => void;
  theme: 'light' | 'sepia' | 'dark';
}

export function PDFReader({ fileData, initialPage, onPageChange, theme }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const { width, height } = useWindowSize();
  
  const isLandscape = width > height && width >= 640;
  const pageWidth = isLandscape ? width / 2 : width;

  useEffect(() => {
    // When orientation changes, snap to even page if in landscape
    if (isLandscape && initialPage % 2 !== 0) {
      onPageChange(Math.max(0, initialPage - 1));
    }
  }, [isLandscape, initialPage, onPageChange]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const renderPage = (index: number) => {
    // PDF pages are 1-indexed
    const pageNumber = index + 1;
    if (pageNumber > numPages || pageNumber < 1) {
      return <div className="w-full h-full bg-transparent flex items-center justify-center text-neutral-400">End</div>;
    }

    return (
      <div className={`w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none ${theme === 'dark' ? 'invert hue-rotate-180' : ''} ${theme === 'sepia' ? 'sepia-[.4]' : ''}`}>
        <Page 
          pageNumber={pageNumber} 
          width={pageWidth}
          height={height}
          className="shadow-2xl"
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<div className="flex items-center justify-center h-full w-full">Loading...</div>}
        />
      </div>
    );
  };

  return (
    <main className="w-full h-full flex items-center justify-center bg-[#0F0F0F] relative">
      <div className="flex w-full h-full relative overflow-hidden bg-white">
        {isLandscape && (
          <>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/20 via-transparent to-black/20 z-30"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-40"></div>
          </>
        )}
        <Document
          file={fileData}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="absolute inset-0 flex items-center justify-center bg-[#0F0F0F] text-gray-400">Loading PDF...</div>}
        >
          {numPages > 0 && (
            <PageFlipper
              currentPage={initialPage}
              totalPages={numPages}
              onPageChange={onPageChange}
              renderPage={renderPage}
            />
          )}
        </Document>
      </div>
    </main>
  );
}
