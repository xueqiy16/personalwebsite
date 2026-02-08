"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore, type Section } from "@/store/useStore";

// ── Palette ──────────────────────────────────────────────────────
const COL = {
  dress: "#B8D8F8",
  skin: "#F5D0A9",
  hair: "#1A1A2E",
  band: "#E8A0B8",
  eyes: "#2C1E1E",
};

// ── Emissive helpers ─────────────────────────────────────────────
const GD = { emissive: "#ffffff" as const, emissiveIntensity: 0.18 };

// ── Position (standing by the tree) ──────────────────────────────
const HOME: [number, number, number] = [0, 8.25, 0];

// ── Fixed look directions per portal ─────────────────────────────
// bodyY  = horizontal body rotation (atan2 convention, +Z = 0)
// headX  = head vertical tilt (negative = look up, positive = look down)
//
// Isometric camera sits at [10,10,10]:
//   Screen-left  ≈ world [-1, 0, +1]  → bodyY ≈ -π/4
//   Screen-right ≈ world [+1, 0, -1]  → bodyY ≈ +3π/4
//   Facing camera (front center)       → bodyY ≈ π/4
const LOOK_DIRS: Record<string, { bodyY: number; headX: number }> = {
  about:    { bodyY: Math.PI / 4,          headX: -0.35 },  // front center, looking up
  arts:     { bodyY: -Math.PI / 4,         headX:  0.5 },   // bottom left, head tilted lower
  projects: { bodyY: Math.PI * 3 / 4,     headX:  0.5 },   // bottom right, head tilted lower
};

/** Map any sub-section to its parent portal key. */
function portalGroup(s: Section): string {
  if (["arts", "dance", "gymnastics", "music"].includes(s)) return "arts";
  if (["projects", "articles", "xposts", "pastprojects"].includes(s))
    return "projects";
  if (s === "about") return "about";
  return "main";
}

// ══════════════════════════════════════════════════════════════════

export default function Character() {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);

  const currentSection = useStore((s) => s.currentSection);
  const hoveredSection = useStore((s) => s.hoveredSection);

  const { pointer, camera } = useThree();

  // ────────────────────────────────────────────────────────────────
  //  BODY + HEAD — cursor tracking OR fixed override
  // ────────────────────────────────────────────────────────────────
  const raycaster = useRef(new THREE.Raycaster());
  const planeHelper = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const hitPoint = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!headRef.current || !groupRef.current) return;

    // Determine if we should use a fixed look direction
    const activeGroup = portalGroup(currentSection);
    const hoverGroup = hoveredSection ? portalGroup(hoveredSection) : null;
    const lookKey = hoverGroup ?? (activeGroup !== "main" ? activeGroup : null);
    const fixedLook = lookKey ? LOOK_DIRS[lookKey] : null;

    if (fixedLook) {
      // ── Fixed look direction (hovered or active section) ──
      let diff = fixedLook.bodyY - groupRef.current.rotation.y;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;

      headRef.current.rotation.x +=
        (fixedLook.headX - headRef.current.rotation.x) * 0.1;
      headRef.current.rotation.y *= 0.85;
      return;
    }

    // ── Free cursor tracking (main view, nothing hovered) ──
    const charWorld = new THREE.Vector3();
    groupRef.current.getWorldPosition(charWorld);

    raycaster.current.setFromCamera(pointer, camera);
    planeHelper.current.set(new THREE.Vector3(0, 1, 0), -charWorld.y);
    const hit = raycaster.current.ray.intersectPlane(
      planeHelper.current,
      hitPoint.current,
    );

    if (hit) {
      const dirX = hit.x - charWorld.x;
      const dirZ = hit.z - charWorld.z;
      const targetBodyY = Math.atan2(dirX, dirZ);
      let diff = targetBodyY - groupRef.current.rotation.y;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.06;
    }

    // ── Head tilts up/down toward cursor ──
    const charNDC = charWorld.clone().project(camera);
    const dy = pointer.y - charNDC.y;
    const targetHeadX = THREE.MathUtils.clamp(-dy * 0.8, -0.5, 0.5);
    headRef.current.rotation.x +=
      (targetHeadX - headRef.current.rotation.x) * 0.08;
    headRef.current.rotation.y *= 0.9;
  });

  // ────────────────────────────────────────────────────────────────
  //  IDLE — legs stay still, body stays still
  // ────────────────────────────────────────────────────────────────
  useFrame(() => {
    if (bodyRef.current) bodyRef.current.position.y *= 0.9;
    if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.9;
    if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.9;
  });

  // ────────────────────────────────────────────────────────────────
  //  GEOMETRY — Chinese girl with long hair down
  // ────────────────────────────────────────────────────────────────
  return (
    <group ref={groupRef} position={[HOME[0], HOME[1], HOME[2]]}>
      <group ref={bodyRef}>
        {/* ── Legs ── */}
        <group ref={leftLegRef} position={[0.06, 0.16, 0]}>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.06, 0.16, 0.06]} />
            <meshStandardMaterial color={COL.dress} {...GD} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[-0.06, 0.16, 0]}>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.06, 0.16, 0.06]} />
            <meshStandardMaterial color={COL.dress} {...GD} />
          </mesh>
        </group>

        {/* ── Dress / body ── */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.13, 0.22, 0.6, 8]} />
          <meshStandardMaterial color={COL.dress} {...GD} />
        </mesh>

        {/* ── Dress accent band ── */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.215, 0.22, 0.035, 8]} />
          <meshStandardMaterial
            color={COL.band}
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* ── Head group ── */}
        <group ref={headRef} position={[0, 0.95, 0]}>
          {/* Face — larger sphere for visibility */}
          <mesh>
            <sphereGeometry args={[0.17, 14, 14]} />
            <meshStandardMaterial
              color={COL.skin}
              emissive={COL.skin}
              emissiveIntensity={0.12}
            />
          </mesh>

          {/* ── Hair — full sphere offset behind face so forehead shows
                naturally. Radius 0.19 fully encloses the skin sphere. ── */}
          <mesh position={[0, 0.01, -0.06]}>
            <sphereGeometry args={[0.19, 16, 16]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

          {/* ── Long hair — left side ── */}
          <mesh position={[0.14, -0.06, -0.02]}>
            <boxGeometry args={[0.06, 0.26, 0.12]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>
          <mesh position={[0.13, -0.24, -0.02]}>
            <boxGeometry args={[0.05, 0.14, 0.1]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

          {/* ── Long hair — right side ── */}
          <mesh position={[-0.14, -0.06, -0.02]}>
            <boxGeometry args={[0.06, 0.26, 0.12]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>
          <mesh position={[-0.13, -0.24, -0.02]}>
            <boxGeometry args={[0.05, 0.14, 0.1]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

          {/* ── Long hair — back (cascading down body) ── */}
          <mesh position={[0, -0.06, -0.13]}>
            <boxGeometry args={[0.26, 0.28, 0.1]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>
          <mesh position={[0, -0.26, -0.11]}>
            <boxGeometry args={[0.2, 0.16, 0.08]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>
          <mesh position={[0, -0.38, -0.09]}>
            <boxGeometry args={[0.14, 0.1, 0.07]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

        </group>
      </group>
    </group>
  );
}
