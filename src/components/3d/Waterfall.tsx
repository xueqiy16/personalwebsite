"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Grand, majestic waterfall cascading from the monument's walkway
 * on the +Z face down into the clouds below.
 *
 * Visual approach:
 *   - Wide luminous white/crystal stream with multiple layers
 *   - 50+ shimmering falling droplets in varied sizes
 *   - Dramatic splash ring and rising mist at the base
 *   - Strong emissive glow and point lights for a radiant look
 */

// ── Configuration ───────────────────────────────────────────

const START_Y = 5.2;
const END_Y = -4.5;
const FALL_HEIGHT = START_Y - END_Y;

const NUM_DROPS = 55;
const NUM_SHIMMER = 18;
const NUM_SPLASH = 12;

// Luminous crystal-white palette
const W = {
  stream: "#E8F8FF",
  drop: "#FFFFFF",
  shimmer: "#D0F4FF",
  mist: "#F0FCFF",
  glow: "#C0EEFF",
};

// ── Sub-components ──────────────────────────────────────────

/** Wide, layered stream body with strong glow */
function StreamBody() {
  const midY = (START_Y + END_Y) / 2;
  const ref = useRef<THREE.Mesh>(null);

  // Gentle pulsing opacity for a living, shimmery feel
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.22 + Math.sin(clock.elapsedTime * 1.5) * 0.04;
  });

  return (
    <group>
      {/* Main wide stream */}
      <mesh ref={ref} position={[0, midY, 0]}>
        <boxGeometry args={[1.4, FALL_HEIGHT, 0.5]} />
        <meshStandardMaterial
          color={W.stream}
          transparent
          opacity={0.22}
          depthWrite={false}
          emissive="#ffffff"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh position={[0, midY, 0]}>
        <boxGeometry args={[0.6, FALL_HEIGHT, 0.25]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.15}
          depthWrite={false}
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Side spray layers */}
      <mesh position={[-0.55, midY, 0]}>
        <boxGeometry args={[0.4, FALL_HEIGHT * 0.85, 0.3]} />
        <meshStandardMaterial
          color={W.shimmer}
          transparent
          opacity={0.1}
          depthWrite={false}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.55, midY, 0]}>
        <boxGeometry args={[0.4, FALL_HEIGHT * 0.85, 0.3]} />
        <meshStandardMaterial
          color={W.shimmer}
          transparent
          opacity={0.1}
          depthWrite={false}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

/** Large animated falling droplets */
function Drops() {
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(
    () =>
      Array.from({ length: NUM_DROPS }, (_, i) => ({
        phase: (i / NUM_DROPS) * FALL_HEIGHT,
        speed: 2.8 + Math.random() * 1.4,
        jitterX: (Math.random() - 0.5) * 1.1,
        jitterZ: (Math.random() - 0.5) * 0.35,
        width: 0.06 + Math.random() * 0.1,
        height: 0.3 + Math.random() * 0.5,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const progress = (t * d.speed + d.phase) % FALL_HEIGHT;
      child.position.y = START_Y - progress;
      child.position.x = d.jitterX;
      child.position.z = d.jitterZ;

      // Bright at top, fade toward bottom
      const ratio = progress / FALL_HEIGHT;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.7 - ratio * 0.45;
      mat.emissiveIntensity = 0.5 - ratio * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i}>
          <boxGeometry args={[d.width, d.height, d.width]} />
          <meshStandardMaterial
            color={W.drop}
            transparent
            opacity={0.7}
            depthWrite={false}
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Smaller shimmering sparkle particles that float around the stream */
function Shimmer() {
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(
    () =>
      Array.from({ length: NUM_SHIMMER }, (_, i) => ({
        phase: (i / NUM_SHIMMER) * FALL_HEIGHT,
        speed: 1.8 + Math.random() * 1.0,
        orbitRadius: 0.4 + Math.random() * 0.6,
        orbitSpeed: 0.8 + Math.random() * 0.6,
        orbitPhase: Math.random() * Math.PI * 2,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const progress = (t * d.speed + d.phase) % FALL_HEIGHT;
      const angle = t * d.orbitSpeed + d.orbitPhase;

      child.position.y = START_Y - progress;
      child.position.x = Math.cos(angle) * d.orbitRadius;
      child.position.z = Math.sin(angle) * d.orbitRadius * 0.5;

      // Twinkle
      const twinkle = Math.sin(t * 4 + i * 2.1) * 0.5 + 0.5;
      child.scale.setScalar(0.5 + twinkle * 0.5);
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.3 + twinkle * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={0.5}
            depthWrite={false}
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Dramatic splash and rising mist at the base */
function Splash() {
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(
    () =>
      Array.from({ length: NUM_SPLASH }, (_, i) => ({
        angle: (i / NUM_SPLASH) * Math.PI * 2,
        radius: 0.4 + Math.random() * 0.8,
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        size: 0.2 + Math.random() * 0.25,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const pulse = Math.sin(t * d.speed + d.phase) * 0.5 + 0.5;

      child.position.x =
        Math.cos(d.angle + t * 0.15) * d.radius * (0.7 + pulse * 0.5);
      child.position.z =
        Math.sin(d.angle + t * 0.15) * d.radius * (0.7 + pulse * 0.5) * 0.6;
      child.position.y = END_Y + pulse * 0.8;

      child.scale.setScalar(0.7 + pulse * 0.5);

      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.08 + pulse * 0.14;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i}>
          <sphereGeometry args={[d.size, 12, 10]} />
          <meshStandardMaterial
            color={W.mist}
            transparent
            opacity={0.12}
            depthWrite={false}
            emissive="#ffffff"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Glowing pool rings at the base */
function Pool() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.18 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
  });

  return (
    <group>
      {/* Outer ring */}
      <mesh
        ref={ref}
        position={[0, END_Y + 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.5, 1.6, 32]} />
        <meshStandardMaterial
          color={W.stream}
          transparent
          opacity={0.2}
          depthWrite={false}
          emissive="#ffffff"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner bright ring */}
      <mesh
        position={[0, END_Y + 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.1, 0.6, 24]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.25}
          depthWrite={false}
          emissive="#ffffff"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ── Main Export ──────────────────────────────────────────────

export default function Waterfall() {
  return (
    <group position={[0, 0, 2.9]}>
      <StreamBody />
      <Drops />
      <Shimmer />
      <Splash />
      <Pool />

      {/* Strong glow lights along the cascade */}
      <pointLight
        position={[0, START_Y - 1, 0.6]}
        intensity={0.8}
        distance={8}
        color="#E0F8FF"
      />
      <pointLight
        position={[0, (START_Y + END_Y) / 2, 0.6]}
        intensity={0.6}
        distance={8}
        color="#FFFFFF"
      />
      <pointLight
        position={[0, END_Y + 1, 0.6]}
        intensity={0.5}
        distance={6}
        color="#E0F8FF"
      />
    </group>
  );
}
