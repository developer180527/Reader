import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';
import { useWindowSize } from 'react-use';

interface PageFlipperProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  renderPage: (index: number) => React.ReactNode;
}

export function PageFlipper({ currentPage, totalPages, onPageChange, renderPage }: PageFlipperProps) {
  const { width } = useWindowSize();
  const isLandscape = width >= 768; // tablet and up

  if (isLandscape) {
    return (
      <LandscapeFlipper 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
        renderPage={renderPage} 
      />
    );
  }

  return (
    <PortraitFlipper 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={onPageChange} 
      renderPage={renderPage} 
    />
  );
}

// Portrait: Single page view. Spine is on the LEFT.
function PortraitFlipper({ currentPage, totalPages, onPageChange, renderPage }: PageFlipperProps) {
  const [flippingDirection, setFlippingDirection] = useState<'next' | 'prev' | null>(null);
  const x = useMotionValue(0);
  const { width } = useWindowSize();
  const controls = useAnimation();

  // Next page: Current page rotates left (0 to -90). Underlying is currentPage + 1.
  // Prev page: An offscreen page from the left rotates right (-90 to 0). It is currentPage - 1. Underlying is currentPage.

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = width * 0.2;
    const velocity = info.velocity.x;
    
    if (flippingDirection === 'next' && (info.offset.x < -threshold || velocity < -500)) {
      // Complete next
      await controls.start({ x: -width, transition: { duration: 0.3 } });
      onPageChange(currentPage + 1);
      x.set(0);
    } else if (flippingDirection === 'prev' && (info.offset.x > threshold || velocity > 500)) {
      // Complete prev
      await controls.start({ x: width, transition: { duration: 0.3 } });
      onPageChange(currentPage - 1);
      x.set(0);
    } else {
      // Revert
      await controls.start({ x: 0, transition: { duration: 0.3 } });
    }
    setFlippingDirection(null);
  };

  // We map the drag X directly to rotateY.
  // When flipping next (x < 0), current page rotates from 0 to -90.
  const rotateYNext = useTransform(x, [-width, 0], [-90, 0]);
  // When flipping prev (x > 0), the incoming previous page rotates from -90 to 0.
  const rotateYPrev = useTransform(x, [0, width], [0, -90]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ perspective: 1500 }}>
      {/* Base layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {flippingDirection === 'next' && currentPage + 1 < totalPages && renderPage(currentPage + 1)}
        {flippingDirection === 'prev' && renderPage(currentPage)}
        {!flippingDirection && renderPage(currentPage)}
      </div>

      {/* Flipping layer for NEXT container */}
      {flippingDirection === 'next' && (
         <motion.div
           className="absolute inset-x-0 inset-y-0 origin-left z-10 pointer-events-none"
           style={{ rotateY: rotateYNext, backfaceVisibility: 'hidden' }}
         >
           {renderPage(currentPage)}
         </motion.div>
      )}

      {/* Flipping layer for PREV container */}
      {flippingDirection === 'prev' && (
         <motion.div
           className="absolute inset-x-0 inset-y-0 origin-left z-10 pointer-events-none"
           style={{ rotateY: rotateYPrev, backfaceVisibility: 'hidden' }}
         >
           {renderPage(currentPage - 1)}
         </motion.div>
      )}

      {/* Drag area */}
      <motion.div
        className="absolute inset-0 z-20"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragStart={(e, info) => {
          // Determine direction
          if (info.velocity.x < 0 && currentPage < totalPages - 1) {
            setFlippingDirection('next');
          } else if (info.velocity.x > 0 && currentPage > 0) {
             setFlippingDirection('prev');
          }
        }}
        onDrag={(e, info) => {
           if (!flippingDirection) {
              if (info.offset.x < -10 && currentPage < totalPages - 1) setFlippingDirection('next');
              else if (info.offset.x > 10 && currentPage > 0) setFlippingDirection('prev');
           }
        }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
      />
    </div>
  );
}

// Landscape: 2 pages view
function LandscapeFlipper({ currentPage, totalPages, onPageChange, renderPage }: PageFlipperProps) {
  // To keep it simple, we treat currentPage as the LEFT page. Right page is currentPage + 1.
  // Wait, physical book: Page 0 (cover) is right page, left is blank.
  // For simplicity: Even pages are left, Odd are right.
  // Let currentPage be an EVEN number.
  // So left = currentPage, right = currentPage + 1.
  const leftPageIndex = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  const rightPageIndex = leftPageIndex + 1;

  const [flippingDirection, setFlippingDirection] = useState<'next' | 'prev' | null>(null);
  const x = useMotionValue(0);
  const { width } = useWindowSize();
  const halfWidth = width / 2;
  const controls = useAnimation();

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = halfWidth * 0.2;
    const velocity = info.velocity.x;
    
    if (flippingDirection === 'next' && (info.offset.x < -threshold || velocity < -500)) {
      await controls.start({ x: -halfWidth, transition: { duration: 0.4 } });
      onPageChange(leftPageIndex + 2);
      x.set(0);
    } else if (flippingDirection === 'prev' && (info.offset.x > threshold || velocity > 500)) {
      await controls.start({ x: halfWidth, transition: { duration: 0.4 } });
      onPageChange(Math.max(0, leftPageIndex - 2));
      x.set(0);
    } else {
      await controls.start({ x: 0, transition: { duration: 0.4 } });
    }
    setFlippingDirection(null);
  };

  const rotateYNext = useTransform(x, [-halfWidth, 0], [-180, 0]);
  const rotateYPrev = useTransform(x, [0, halfWidth], [0, 180]);

  return (
    <div className="relative w-full h-full flex overflow-hidden" style={{ perspective: 2500 }}>
      {/* Background Left Half */}
      <div className="w-1/2 h-full z-0">
        {flippingDirection === 'prev' && leftPageIndex - 2 >= 0 ? renderPage(leftPageIndex - 2) : renderPage(leftPageIndex)}
      </div>

      {/* Background Right Half */}
      <div className="w-1/2 h-full z-0">
        {flippingDirection === 'next' && rightPageIndex + 2 < totalPages ? renderPage(rightPageIndex + 2) : renderPage(rightPageIndex)}
      </div>

      {/* The Central Flipping Container */}
      <div className="absolute inset-y-0 left-1/2 w-1/2 pointer-events-none z-10" style={{ transformStyle: 'preserve-3d' }}>
         {/* Flipping NEXT (Right to Left) */}
         {flippingDirection === 'next' && (
           <motion.div
             className="absolute inset-0 origin-left"
             style={{ rotateY: rotateYNext, transformStyle: 'preserve-3d' }}
           >
             {/* Front of flipping page (The old Right Page) */}
             <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
               {renderPage(rightPageIndex)}
             </div>
             {/* Back of flipping page (The new Left Page) */}
             <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
               {renderPage(leftPageIndex + 2)}
             </div>
           </motion.div>
         )}

         {/* Flipping PREV (Left to Right) - Anchored at the same spine, but we flip a Left page! */}
         {flippingDirection === 'prev' && leftPageIndex > 0 && (
           <motion.div
             className="absolute inset-y-0 right-full w-full origin-right"
             style={{ rotateY: rotateYPrev, transformStyle: 'preserve-3d' }}
           >
             {/* Front of flipping page (The old Left Page) */}
             <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
               {renderPage(leftPageIndex)}
             </div>
             {/* Back of flipping page (The new Right Page) */}
             <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(-180deg)' }}>
               {renderPage(leftPageIndex - 1)}
             </div>
           </motion.div>
         )}
      </div>

      {/* Drag Receiver */}
      <motion.div
        className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragStart={(e, info) => {
          if (info.velocity.x < 0 && leftPageIndex + 2 < totalPages) setFlippingDirection('next');
          else if (info.velocity.x > 0 && leftPageIndex > 0) setFlippingDirection('prev');
        }}
        onDrag={(e, info) => {
           if (!flippingDirection) {
              if (info.offset.x < -10 && leftPageIndex + 2 < totalPages) setFlippingDirection('next');
              else if (info.offset.x > 10 && leftPageIndex > 0) setFlippingDirection('prev');
           }
        }}
         onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
      />
    </div>
  );
}
