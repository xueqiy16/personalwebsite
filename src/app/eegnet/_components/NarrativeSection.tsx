"use client";

interface NarrativeSectionProps {
  id: string;
  children: React.ReactNode;
}

/**
 * A full-height narrative block for the left scroll column.
 * Each section fills at least one viewport so scroll-telling
 * transitions align with the sticky visualisation on the right.
 */
export default function NarrativeSection({ id, children }: NarrativeSectionProps) {
  return (
    <section
      id={id}
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 py-24"
    >
      {/* TODO: Replace children with your narrative content */}
      {children}
    </section>
  );
}
