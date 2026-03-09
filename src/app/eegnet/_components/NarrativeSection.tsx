"use client";

interface NarrativeSectionProps {
  id: string;
  children: React.ReactNode;
}

export default function NarrativeSection({ id, children }: NarrativeSectionProps) {
  return (
    <section id={id} className="px-6 md:px-12 py-8 md:py-12">
      {children}
    </section>
  );
}
