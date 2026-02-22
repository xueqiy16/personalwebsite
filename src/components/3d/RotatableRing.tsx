"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useStore } from "@/store/useStore";
import { audio } from "@/lib/audio";

// ── Palette (mirrors Monument.tsx) ──────────────────────────
const C = {
  warmWhite: "#FFD1FA",
  teal: "#7DFF9A",
  tealLight: "#00D170",
  deep: "#9888C0",
  platform: "#E0D8F0",
  accent: "#00D1D1",
};
const G = { emissive: "#ffffff" as const, emissiveIntensity: 0.22 };

// ── Snap angle helper ───────────────────────────────────────
function snapTo90(radians: number): number {
  const deg = ((radians * 180) / Math.PI) % 360;
  const norm = ((deg % 360) + 360) % 360;
  const snapped = Math.round(norm / 90) * 90;
  return (snapped * Math.PI) / 180;
}

export default function RotatableRing() {
  const groupRef = useRef<THREE.Group>(null!);
  const dragging = useRef(false);
  const dragStartAngle = useRef(0);
  const ringStartAngle = useRef(0);

  const setRingRotation = useStore((s) => s.setRingRotation);
  const { camera, pointer } = useThree();

  const [handleHovered, setHandleHovered] = useState(false);

  const planeRef = useRef(
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -5.45),
  );
  const raycaster = useRef(new THREE.Raycaster());
  const hitPoint = useRef(new THREE.Vector3());

  const getPointerAngle = useCallback((): number | null => {
    raycaster.current.setFromCamera(pointer, camera);
    const hit = raycaster.current.ray.intersectPlane(
      planeRef.current,
      hitPoint.current,
    );
    if (!hit) return null;
    return Math.atan2(hit.x, hit.z);
  }, [pointer, camera]);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const angle = getPointerAngle();
      if (angle === null) return;
      dragging.current = true;
      dragStartAngle.current = angle;
      ringStartAngle.current = groupRef.current.rotation.y;
      document.body.style.cursor = "grabbing";
    },
    [getPointerAngle],
  );

  useFrame(() => {
    if (!dragging.current) return;
    const angle = getPointerAngle();
    if (angle === null) return;
    const delta = angle - dragStartAngle.current;
    groupRef.current.rotation.y = ringStartAngle.current + delta;
  });

  const finishDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "default";

    const snapped = snapTo90(groupRef.current.rotation.y);
    gsap.to(groupRef.current.rotation, {
      y: snapped,
      duration: 0.35,
      ease: "back.out(1.5)",
      onComplete: () => {
        const deg =
          (((snapped * 180) / Math.PI) % 360 + 360) % 360;
        setRingRotation(Math.round(deg));
        audio.playRotate();
      },
    });
  }, [setRingRotation]);

  return (
    <group
      ref={groupRef}
      onPointerUp={finishDrag}
      onPointerLeave={finishDrag}
    >
      {/* ── Core block ── */}
      <mesh position={[0, 5.45, 0]}>
        <boxGeometry args={[3.8, 2.3, 3.8]} />
        <meshStandardMaterial color={C.warmWhite} {...G} />
      </mesh>

      {/* ── Teal accent +Z ── */}
      <mesh position={[-1.1, 5.2, 2.1]}>
        <boxGeometry args={[1.2, 1.6, 0.6]} />
        <meshStandardMaterial color={C.teal} {...G} />
      </mesh>

      {/* ── Teal accent +X ── */}
      <mesh position={[2.1, 5.2, -1.1]}>
        <boxGeometry args={[0.6, 1.6, 1.2]} />
        <meshStandardMaterial color={C.teal} {...G} />
      </mesh>

      {/* ── Small teal block +X (lower) ── */}
      <mesh position={[2.0, 4.8, 1.2]}>
        <boxGeometry args={[0.5, 0.8, 0.8]} />
        <meshStandardMaterial color={C.tealLight} {...G} />
      </mesh>

      {/* ── Decorative circles +Z ── */}
      {[
        { x: 0.8, y: 5.6 },
        { x: 0.8, y: 4.8 },
      ].map((c, i) => (
        <mesh
          key={`cz-${i}`}
          position={[c.x, c.y, 1.92]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.25, 0.25, 0.06, 12]} />
          <meshStandardMaterial color={C.deep} />
        </mesh>
      ))}

      {/* ── Decorative circles +X ── */}
      {[
        { z: 0.8, y: 5.6 },
        { z: 0.8, y: 4.8 },
      ].map((c, i) => (
        <mesh
          key={`cx-${i}`}
          position={[1.92, c.y, c.z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.25, 0.25, 0.06, 12]} />
          <meshStandardMaterial color={C.deep} />
        </mesh>
      ))}

      {/* ── Windows ── */}
      <mesh position={[1.5, 6.0, 1.92]}>
        <boxGeometry args={[0.45, 0.65, 0.06]} />
        <meshStandardMaterial color={C.deep} />
      </mesh>
      <mesh position={[1.92, 6.0, 1.5]}>
        <boxGeometry args={[0.06, 0.65, 0.45]} />
        <meshStandardMaterial color={C.deep} />
      </mesh>

      {/* ── Bridge A: +Z walkway ── */}
      <mesh position={[0, 5.3, 2.7]}>
        <boxGeometry args={[1.4, 0.12, 1.0]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      <mesh position={[0, 5.6, 3.15]}>
        <boxGeometry args={[1.4, 0.5, 0.06]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* ── Bridge B: +X walkway ── */}
      <mesh position={[2.7, 5.8, 0]}>
        <boxGeometry args={[1.0, 0.12, 1.2]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      {/* ── Rotation handle (visible knob on +Z outer edge) ── */}
      <group position={[0, 5.3, 3.35]}>
        <mesh
          onPointerDown={handlePointerDown}
          onPointerEnter={() => {
            setHandleHovered(true);
            document.body.style.cursor = "grab";
          }}
          onPointerLeave={() => {
            if (!dragging.current) {
              setHandleHovered(false);
              document.body.style.cursor = "default";
            }
          }}
        >
          <cylinderGeometry args={[0.18, 0.18, 0.14, 16]} />
          <meshStandardMaterial
            color={handleHovered ? "#FFD700" : C.accent}
            emissive={handleHovered ? "#FFD700" : "#00D1D1"}
            emissiveIntensity={handleHovered ? 0.6 : 0.3}
          />
        </mesh>
        {/* Decorative ring around the handle */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.03, 8, 20]} />
          <meshStandardMaterial
            color={handleHovered ? "#FFD700" : C.platform}
            emissive={handleHovered ? "#FFD700" : "#ffffff"}
            emissiveIntensity={handleHovered ? 0.5 : 0.15}
          />
        </mesh>
      </group>
    </group>
  );
}
