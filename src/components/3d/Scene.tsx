"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";

import Monument from "./Monument";
import Environment from "./Environment";
import Portal from "./Portal";
import Character from "./Character";
import CameraController from "./CameraController";

// ── Responsive zoom — fit the monument on any screen ─────────────
function useResponsiveZoom() {
  const [zoom, setZoom] = useState(45);

  useEffect(() => {
    function calc() {
      const w = window.innerWidth;
      if (w < 480) return 24;       // small phone
      if (w < 640) return 30;       // phone
      if (w < 768) return 35;       // large phone / small tablet
      if (w < 1024) return 40;      // tablet
      return 45;                    // desktop
    }
    const update = () => setZoom(calc());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return zoom;
}

/**
 * Forces the default camera to look at a world-space target.
 * Must live inside the <Canvas> so it can access the R3F store.
 */
function CameraSetup({ target }: { target: [number, number, number] }) {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, target]);
  return null;
}

// Memoised heavy sub-trees — avoids re-rendering when parent state changes
const MemoMonument = memo(Monument);
const MemoEnvironment = memo(Environment);
const MemoCharacter = memo(Character);

/**
 * Main 3D scene — a Monument Valley-inspired tower floating in a
 * bright sky on white clouds, with interactive portals.
 */
export default function Scene() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const sceneGroupRef = useRef<THREE.Group>(null!);
  const baseZoom = useResponsiveZoom();

  return (
    <Canvas
      className="w-full h-full"
      gl={{
        antialias: true,
        toneMapping: THREE.NoToneMapping,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      style={{ background: "linear-gradient(180deg, #C8EDE8 0%, #FFF8D6 100%)" }}
      // Ensure touch events are forwarded for mobile interactions
      touch-action="none"
    >
      {/* Isometric orthographic camera — zoom adapts to viewport */}
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        zoom={baseZoom}
        position={[10, 10, 10]}
        near={0.1}
        far={1000}
      />
      <CameraSetup target={[0, 0, 0]} />
      <CameraController groupRef={sceneGroupRef} baseZoom={baseZoom} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[8, 14, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <directionalLight position={[-4, 8, -2]} intensity={0.5} />
      <directionalLight position={[0, -5, 6]} intensity={0.25} color="#FFF8E0" />

      {/* Scene group — animated by CameraController */}
      <group ref={sceneGroupRef} position={[0, -5.5, 0]}>
        <MemoMonument />
        <MemoEnvironment />
        <MemoCharacter />

        {/* ===== Interactive Portals ===== */}

        <Portal
          position={[-1.2, 1.4, 3.5]}
          size={[3.8, 2.8, 0.6]}
          section="arts"
          label="My Beloved Arts"
          labelOffsetY={2.2}
        />

        <Portal
          position={[3.5, 1.4, -1.2]}
          size={[0.6, 2.8, 3.8]}
          section="projects"
          label="My Projects"
          labelOffsetY={2.2}
        />

        <Portal
          position={[0, 9.5, 0]}
          size={[2.8, 3.2, 2.8]}
          section="about"
          label="About Me"
          labelOffsetY={2.4}
        />
      </group>
    </Canvas>
  );
}
