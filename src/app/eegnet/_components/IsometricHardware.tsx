"use client";

/**
 * 3D isometric representation of a Muse headband.
 *
 * Will use @react-three/fiber + @react-three/drei.
 * The parent StickyCanvas provides the viewport-sized container.
 */
export default function IsometricHardware() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* TODO: Replace with <Canvas> from @react-three/fiber */}
      {/* TODO: Build Muse headband geometry (band, sensors, housing) */}
      {/* TODO: Add OrthographicCamera for isometric perspective */}
      {/* TODO: Add lighting and subtle idle animation */}
      <p className="text-sm text-neutral-400 select-none">
        [ IsometricHardware — 3D Muse headband placeholder ]
      </p>
    </div>
  );
}
