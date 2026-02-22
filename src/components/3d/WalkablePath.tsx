"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { getNode } from "@/lib/pathfinding";

/**
 * Renders glowing dots along the active walk path.
 * Dots pulse softly and fade out behind the character as it passes.
 */
export default function WalkablePath() {
  const walkPath = useStore((s) => s.walkPath);
  const characterNodeId = useStore((s) => s.characterNodeId);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    if (!walkPath) return;

    const charIdx = walkPath.indexOf(characterNodeId);
    const t = clock.elapsedTime;

    for (let i = 0; i < meshRefs.current.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (i <= charIdx) {
        mat.opacity = Math.max(0, mat.opacity - 0.05);
      } else {
        const pulse = 0.4 + 0.3 * Math.sin(t * 3 + i * 0.7);
        mat.opacity = pulse;
        mat.emissiveIntensity = 0.5 + 0.3 * Math.sin(t * 4 + i);
      }
    }
  });

  if (!walkPath || walkPath.length < 2) return null;

  return (
    <group>
      {walkPath.map((nodeId, i) => {
        const node = getNode(nodeId);
        if (!node) return null;
        const [x, y, z] = node.position;
        return (
          <mesh
            key={`wp-${i}`}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            position={[x, y + 0.15, z]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#FFD700"
              emissiveIntensity={0.6}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
