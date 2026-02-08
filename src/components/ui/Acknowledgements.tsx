"use client";

/**
 * Small acknowledgements text in the bottom-right corner,
 * positioned above the MuteToggle button.
 */
export default function Acknowledgements() {
  return (
    <div
      className="fixed bottom-16 sm:bottom-18 right-3 sm:right-6 z-40 max-w-48 sm:max-w-56 text-right select-none"
      style={{
        fontSize: "8px",
        lineHeight: "1.5",
        color: "rgba(100, 88, 160, 0.6)",
        letterSpacing: "0.02em",
      }}
    >
      <p>
        Music:{" "}
        <a
          href="https://www.youtube.com/watch?v=Pppexz-KKig&list=PL4ftiOqfSU8gTv8cJMz5kkJkhjijzV9Uk&index=18"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(100, 88, 160, 0.75)", textDecoration: "underline" }}
        >
          Pachelbel &mdash; Canon in D-dur
        </a>
      </p>
      <p style={{ marginTop: "2px" }}>
        Theme inspired by{" "}
        <span style={{ fontStyle: "italic" }}>Monument Valley</span>
      </p>
    </div>
  );
}
