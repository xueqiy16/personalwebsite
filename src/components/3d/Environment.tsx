"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Sky environment — soft, fluffy white clouds that gently bob up and down.
 */

// Shared material props for cloud spheres
const CLOUD_MAT = {
  color: "#FFFFFF" as const,
  roughness: 1,
  metalness: 0,
};

// ===== Individual cloud (cluster of overlapping smooth spheres) =====
function CloudShape() {
  return (
    <>
      {/* Core puffs */}
      <mesh>
        <sphereGeometry args={[1.0, 20, 16]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[1.2, 0.15, 0.3]}>
        <sphereGeometry args={[0.9, 20, 16]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[-1.05, -0.05, -0.15]}>
        <sphereGeometry args={[0.95, 20, 16]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[0.5, -0.1, -0.75]}>
        <sphereGeometry args={[0.8, 20, 16]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[-0.35, 0.18, 0.7]}>
        <sphereGeometry args={[0.82, 20, 16]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>

      {/* Extra puffs for fluffier look */}
      <mesh position={[0.7, 0.3, 0.6]}>
        <sphereGeometry args={[0.65, 16, 12]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[-0.8, 0.25, -0.5]}>
        <sphereGeometry args={[0.6, 16, 12]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[1.6, -0.05, -0.2]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
      <mesh position={[-1.5, 0.08, 0.4]}>
        <sphereGeometry args={[0.58, 16, 12]} />
        <meshStandardMaterial {...CLOUD_MAT} />
      </mesh>
    </>
  );
}

// ===== Animated cloud wrapper — bobs up and down gently =====
function AnimatedCloud({
  position,
  scale = 1,
  index,
}: {
  position: [number, number, number];
  scale?: number;
  index: number;
}) {
  const ref = useRef<THREE.Group>(null);

  // Each cloud gets a unique speed, amplitude and phase so they feel organic
  const motion = useMemo(
    () => ({
      speed: 0.25 + (index % 7) * 0.04,
      amplitude: 0.12 + (index % 5) * 0.03,
      phase: index * 1.7,
    }),
    [index],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y =
      position[1] +
      Math.sin(clock.elapsedTime * motion.speed + motion.phase) *
        motion.amplitude;
  });

  return (
    <group ref={ref} position={position}>
      <group scale={[scale, scale * 0.5, scale]}>
        <CloudShape />
      </group>
    </group>
  );
}

// ===== Twinkling stars / sparkles scattered among the clouds =====

const NUM_STARS = 18;

// Hand-placed positions to sit visibly among / above the clouds
const starData: {
  pos: [number, number, number];
  size: number;
  speed: number;
  phase: number;
  isYellow: boolean;
}[] = [
  // Near base clouds
  { pos: [4, 0.5, 4], size: 0.22, speed: 1.4, phase: 0, isYellow: false },
  { pos: [-4.5, 0, 3], size: 0.18, speed: 1.8, phase: 1.2, isYellow: true },
  { pos: [3, -0.5, -3.5], size: 0.2, speed: 1.3, phase: 2.5, isYellow: false },
  { pos: [-3, -1, -4], size: 0.16, speed: 2.0, phase: 3.8, isYellow: true },

  // Mid-level
  { pos: [8, 1, 3], size: 0.25, speed: 1.1, phase: 0.8, isYellow: false },
  { pos: [-8, 2, 2], size: 0.2, speed: 1.6, phase: 4.1, isYellow: false },
  { pos: [5, 3, -6], size: 0.18, speed: 1.9, phase: 5.3, isYellow: true },
  { pos: [-5, 4, -4], size: 0.22, speed: 1.2, phase: 2.0, isYellow: false },
  { pos: [7, 2, 6], size: 0.16, speed: 2.2, phase: 6.1, isYellow: false },

  // Higher up
  { pos: [6, 6, -2], size: 0.24, speed: 1.0, phase: 1.5, isYellow: true },
  { pos: [-4, 7, 4], size: 0.2, speed: 1.5, phase: 3.3, isYellow: false },
  { pos: [3, 9, 4], size: 0.18, speed: 1.7, phase: 4.7, isYellow: false },
  { pos: [-6, 5, -3], size: 0.22, speed: 1.3, phase: 0.4, isYellow: true },
  { pos: [5, 8, -4], size: 0.16, speed: 2.1, phase: 5.9, isYellow: false },

  // Far / background
  { pos: [10, 0, -6], size: 0.2, speed: 1.4, phase: 2.8, isYellow: false },
  { pos: [-9, 1, -6], size: 0.18, speed: 1.6, phase: 1.0, isYellow: true },
  { pos: [2, -2, 8], size: 0.22, speed: 1.2, phase: 3.6, isYellow: false },
  { pos: [-7, 1, 7], size: 0.16, speed: 1.9, phase: 5.0, isYellow: false },
];

function Stars() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const d = starData[i];
      const twinkle = Math.sin(t * d.speed + d.phase) * 0.5 + 0.5;

      // Pulse between 40% and full size
      child.scale.setScalar(0.4 + twinkle * 0.6);

      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.3 + twinkle * 0.7;
      mat.emissiveIntensity = 0.6 + twinkle * 0.8;
    });
  });

  return (
    <group ref={groupRef}>
      {starData.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[d.size, 8, 8]} />
          <meshStandardMaterial
            color={d.isYellow ? "#FFFDE0" : "#FFFFFF"}
            transparent
            opacity={0.6}
            depthWrite={false}
            emissive={d.isYellow ? "#FFF8A0" : "#FFFFFF"}
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ===== Shooting stars — periodic streaks across the sky =====

const NUM_SHOOTING = 5;

interface ShootingStar {
  start: [number, number, number];
  dir: [number, number, number];
  speed: number;
  interval: number;
  offset: number;
  trailLen: number;
}

// Positions are relative to the scene group (which sits at y = -5.5).
// The camera sees roughly ±12 units from origin, so keep starts within view.
const shootingData: ShootingStar[] = [
  { start: [-8, 10, -4], dir: [0.8, -0.45, 0.35], speed: 14, interval: 6, offset: 0, trailLen: 3.0 },
  { start: [7, 12, 3], dir: [-0.7, -0.55, -0.25], speed: 16, interval: 8, offset: 2.5, trailLen: 3.5 },
  { start: [4, 14, -6], dir: [-0.35, -0.65, 0.45], speed: 12, interval: 10, offset: 5, trailLen: 2.8 },
  { start: [-6, 8, 5], dir: [0.65, -0.5, -0.35], speed: 15, interval: 7, offset: 3.5, trailLen: 3.2 },
  { start: [1, 16, -5], dir: [0.4, -0.75, 0.25], speed: 18, interval: 12, offset: 7, trailLen: 4.0 },
];

// Pre-compute normalised direction vectors and quaternions
const shootingDirVecs = shootingData.map((d) =>
  new THREE.Vector3(d.dir[0], d.dir[1], d.dir[2]).normalize(),
);
const Y_UP = new THREE.Vector3(0, 1, 0);

function ShootingStars() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    for (let i = 0; i < NUM_SHOOTING; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      const d = shootingData[i];
      const cycle = ((t + d.offset) % d.interval) / d.interval;

      // Active during the first 18% of each cycle
      const active = cycle < 0.18;
      const localT = cycle / 0.18;

      if (active) {
        const dist = localT * d.speed;
        mesh.position.set(
          d.start[0] + d.dir[0] * dist,
          d.start[1] + d.dir[1] * dist,
          d.start[2] + d.dir[2] * dist,
        );

        // Fade in then out
        const fade = localT < 0.25
          ? localT / 0.25
          : 1 - (localT - 0.25) / 0.75;

        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = fade * 0.95;
        mat.emissiveIntensity = 1.0 + fade * 1.5;

        // Scale: cylinder height (Y) = trail length, radius (X/Z) = thickness
        const len = d.trailLen * Math.max(fade, 0.15);
        mesh.scale.set(0.12, len, 0.12);

        // Align the cylinder's Y axis with the travel direction
        mesh.quaternion.setFromUnitVectors(Y_UP, shootingDirVecs[i]);

        mesh.visible = true;
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {shootingData.map((_, i) => (
        <mesh
          key={`shooting-${i}`}
          ref={(el) => { meshRefs.current[i] = el; }}
          visible={false}
        >
          {/* Tapered cylinder: thin head (0.01) → wider tail (0.1), height 1 (scaled at runtime) */}
          <cylinderGeometry args={[0.01, 0.1, 1, 6]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={0}
            depthWrite={false}
            emissive="#FFFFFF"
            emissiveIntensity={2.0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ===== Cloud placement data =====
const clouds: { pos: [number, number, number]; scale: number }[] = [
  // Large base clouds — monument "sits" on these
  { pos: [0, -1.5, 0], scale: 3.0 },
  { pos: [2.5, -2, 2.5], scale: 2.2 },
  { pos: [-2.2, -2.2, -1], scale: 2.0 },
  { pos: [1.5, -2.5, -2], scale: 1.8 },
  { pos: [-1.5, -1.8, 2.2], scale: 1.6 },

  // Mid-level clouds beside the monument
  { pos: [7, -0.5, 5], scale: 1.5 },
  { pos: [-7, 0.5, 4], scale: 1.3 },
  { pos: [6, 2, -7], scale: 1.2 },
  { pos: [-6, 3, -5], scale: 1.0 },
  { pos: [5, 1, 7], scale: 1.1 },

  // Higher floating wisps
  { pos: [8, 5, -3], scale: 0.9 },
  { pos: [-5, 8, 3], scale: 0.7 },
  { pos: [4, 10, 5], scale: 0.6 },
  { pos: [-3, 6, -6], scale: 0.8 },

  // Background / distant clouds
  { pos: [10, -1, -8], scale: 1.6 },
  { pos: [-9, -1.5, -7], scale: 1.4 },
  { pos: [3, -3, 9], scale: 1.8 },
  { pos: [-8, 0, 8], scale: 1.2 },
];

// ===== Main environment =====
export default function Environment() {
  return (
    <group>
      {clouds.map((c, i) => (
        <AnimatedCloud
          key={`cloud-${i}`}
          position={c.pos}
          scale={c.scale}
          index={i}
        />
      ))}
      <Stars />
      <ShootingStars />
    </group>
  );
}
