"use client";

interface StickyCanvasProps {
  children: React.ReactNode;
}

/**
 * Right-side sticky container that stays locked in the viewport
 * while the left narrative column scrolls. Houses all visualisations.
 */
export default function StickyCanvas({ children }: StickyCanvasProps) {
  return (
    <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
      {/* TODO: Swap children dynamically based on scroll position / active section */}
      {children}
    </div>
  );
}
