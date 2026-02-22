import InteractiveHeader from "./_components/InteractiveHeader";
import NarrativeSection from "./_components/NarrativeSection";
import StickyCanvas from "./_components/StickyCanvas";
import IsometricHardware from "./_components/IsometricHardware";
import RawSignalChart from "./_components/RawSignalChart";
import ClassifierInterface from "./_components/ClassifierInterface";

export const metadata = {
  title: "EEGNet — Signal Processing Documentation",
  description:
    "Interactive scroll-telling documentation for the EEGNet signal processing project.",
};

/**
 * /eegnet — scroll-telling documentation page.
 *
 * Hero: full-width interactive neural-mesh header with title.
 *
 * Desktop: two-column layout below the hero.
 *   Left  → scrolling narrative sections (each ≥ 100vh tall).
 *   Right → sticky visualisation canvas that swaps content as the user scrolls.
 *
 * Mobile: stacks vertically (narrative on top, vis below each section).
 */
export default function EEGNetPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* ── Hero header with interactive neural mesh ── */}
      <InteractiveHeader />
      {/* ── Two-column scroll-tell layout ─────────────────────── */}
      <div className="flex flex-col lg:flex-row">
        {/* ── Left: scrolling narrative ── */}
        <div className="w-full lg:w-1/2">
          {/* TODO: Add an Intersection Observer or scroll-spy to detect
              which section is active and swap the right-side visualisation */}

          <NarrativeSection id="intro">
            {/* TODO: Write your project introduction / hero content */}
            <h1 className="text-4xl font-bold tracking-tight mb-4">EEGNet</h1>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Placeholder — introduce the project, motivation, and goals here.
            </p>
          </NarrativeSection>

          <NarrativeSection id="hardware">
            {/* TODO: Describe the Muse headband hardware and electrode placement */}
            <h2 className="text-3xl font-semibold mb-4">Hardware</h2>
            <p className="text-neutral-400 leading-relaxed">
              Placeholder — Muse headband, electrode positions (TP9, AF7, AF8, TP10),
              sampling rate, data format.
            </p>
          </NarrativeSection>

          <NarrativeSection id="signals">
            {/* TODO: Explain raw EEG signals, frequency bands, artefacts */}
            <h2 className="text-3xl font-semibold mb-4">Raw Signals</h2>
            <p className="text-neutral-400 leading-relaxed">
              Placeholder — P300 / Mu-rhythms, frequency bands (delta, theta,
              alpha, beta, gamma), artefact rejection.
            </p>
          </NarrativeSection>

          <NarrativeSection id="classifier">
            {/* TODO: Document the classification pipeline and TD-Snap interface */}
            <h2 className="text-3xl font-semibold mb-4">Classifier &amp; Interface</h2>
            <p className="text-neutral-400 leading-relaxed">
              Placeholder — feature extraction, model architecture, real-time
              inference, TD-Snap word selection.
            </p>
          </NarrativeSection>
        </div>

        {/* ── Right: sticky visualisation canvas ── */}
        <div className="hidden lg:block w-1/2">
          <StickyCanvas>
            {/* TODO: Conditionally render one of the three visualisations
                based on the active narrative section.
                For now all three are stacked as placeholders. */}
            <div className="flex flex-col items-center gap-8">
              <IsometricHardware />
              <RawSignalChart />
              <ClassifierInterface />
            </div>
          </StickyCanvas>
        </div>
      </div>
    </div>
  );
}
