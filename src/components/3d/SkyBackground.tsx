"use client";

import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { getSkyGradient } from "../../lib/skyColors";

/** Updates the Canvas CSS background each frame for the slow sky color cycle. */
export default function SkyBackground() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.domElement.style.background = getSkyGradient(0);
  }, [gl]);

  useFrame(({ clock }) => {
    gl.domElement.style.background = getSkyGradient(clock.elapsedTime);
  });

  return null;
}
