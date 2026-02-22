"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore, type Section } from "@/store/useStore";
import { getNode, findPath } from "@/lib/pathfinding";
import { audio } from "@/lib/audio";

// ── Palette ──────────────────────────────────────────────────
const COL = {
  dress: "#B8D8F8",
  skin: "#F5D0A9",
  hair: "#1A1A2E",
  band: "#E8A0B8",
};
const GD = { emissive: "#ffffff" as const, emissiveIntensity: 0.18 };

// ── Fixed look directions per portal ─────────────────────────
const LOOK_DIRS: Record<string, { bodyY: number; headX: number }> = {
  about: { bodyY: Math.PI / 4, headX: -0.35 },
  arts: { bodyY: -Math.PI / 4, headX: 0.5 },
  projects: { bodyY: (Math.PI * 3) / 4, headX: 0.5 },
};

function portalGroup(s: Section): string {
  if (["arts", "dance", "gymnastics", "music"].includes(s)) return "arts";
  if (["projects", "articles", "xposts", "pastprojects"].includes(s))
    return "projects";
  if (s === "about") return "about";
  return "main";
}

// ── Walking constants ────────────────────────────────────────
const WALK_SPEED = 2.8;
const LEG_SWING = 0.45;
const BOB_AMP = 0.03;
const FOOTSTEP_INTERVAL = 0.35;

export default function Character() {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);

  const currentSection = useStore((s) => s.currentSection);
  const hoveredSection = useStore((s) => s.hoveredSection);
  const walkPath = useStore((s) => s.walkPath);
  const isWalking = useStore((s) => s.isWalking);
  const characterNodeId = useStore((s) => s.characterNodeId);
  const walkTarget = useStore((s) => s.walkTarget);

  const ringRotation = useStore((s) => s.ringRotation);
  const setWalkPath = useStore((s) => s.setWalkPath);
  const setIsWalking = useStore((s) => s.setIsWalking);
  const setCharacterNodeId = useStore((s) => s.setCharacterNodeId);
  const setWalkTarget = useStore((s) => s.setWalkTarget);
  const navigateTo = useStore((s) => s.navigateTo);

  const { pointer, camera } = useThree();

  // Walking state refs (non-reactive for useFrame perf)
  const walkIdx = useRef(0);
  const walkProgress = useRef(0);
  const walkFrom = useRef(new THREE.Vector3());
  const walkTo = useRef(new THREE.Vector3());
  const segmentLen = useRef(1);
  const walkTime = useRef(0);
  const lastFootstep = useRef(0);

  // ── Start walking when walkPath changes ────────────────────
  useEffect(() => {
    if (!walkPath || walkPath.length < 2) return;

    walkIdx.current = 0;
    walkProgress.current = 0;

    const n0 = getNode(walkPath[0]);
    const n1 = getNode(walkPath[1]);
    if (!n0 || !n1) return;

    walkFrom.current.set(...n0.position);
    walkTo.current.set(...n1.position);
    segmentLen.current = walkFrom.current.distanceTo(walkTo.current);
    walkTime.current = 0;
    lastFootstep.current = 0;

    setIsWalking(true);
  }, [walkPath, setIsWalking]);

  // ── Walking frame loop ─────────────────────────────────────
  useFrame((_, delta) => {
    if (!isWalking || !walkPath || walkPath.length < 2) return;
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05);
    walkTime.current += dt;
    const stepDist = WALK_SPEED * dt;
    walkProgress.current += stepDist;

    // Footstep SFX
    if (walkTime.current - lastFootstep.current > FOOTSTEP_INTERVAL) {
      lastFootstep.current = walkTime.current;
      audio.playFootstep();
    }

    // Advance through path segments
    while (
      walkProgress.current >= segmentLen.current &&
      walkIdx.current < walkPath.length - 2
    ) {
      walkProgress.current -= segmentLen.current;
      walkIdx.current += 1;

      const nextI = walkIdx.current + 1;
      const nFrom = getNode(walkPath[walkIdx.current]);
      const nTo = getNode(walkPath[nextI]);
      if (!nFrom || !nTo) break;

      walkFrom.current.set(...nFrom.position);
      walkTo.current.set(...nTo.position);
      segmentLen.current = walkFrom.current.distanceTo(walkTo.current);

      setCharacterNodeId(walkPath[walkIdx.current]);
    }

    // Lerp position along current segment
    const t = Math.min(walkProgress.current / segmentLen.current, 1);
    const pos = new THREE.Vector3().lerpVectors(
      walkFrom.current,
      walkTo.current,
      t,
    );
    groupRef.current.position.copy(pos);

    // Walking animation — leg swing + body bob
    const swing = Math.sin(walkTime.current * 10) * LEG_SWING;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(walkTime.current * 10)) * BOB_AMP;
    }

    // Face direction of travel
    const dir = new THREE.Vector3()
      .subVectors(walkTo.current, walkFrom.current)
      .normalize();
    if (dir.lengthSq() > 0.001) {
      const targetY = Math.atan2(dir.x, dir.z);
      let diff = targetY - groupRef.current.rotation.y;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.15;
    }

    // Check if arrived at last node
    if (
      walkIdx.current >= walkPath.length - 2 &&
      walkProgress.current >= segmentLen.current
    ) {
      const lastNode = walkPath[walkPath.length - 1];
      const ln = getNode(lastNode);
      if (ln) groupRef.current.position.set(...ln.position);

      setCharacterNodeId(lastNode);
      setIsWalking(false);
      setWalkPath(null);

      if (walkTarget) {
        setTimeout(() => {
          navigateTo(walkTarget);
          setWalkTarget(null);
        }, 300);
      }
    }
  });

  // ── Idle: head/body tracking (only when NOT walking) ───────
  const raycaster = useRef(new THREE.Raycaster());
  const planeHelper = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const hitPoint = useRef(new THREE.Vector3());

  useFrame(() => {
    if (isWalking) return;
    if (!headRef.current || !groupRef.current) return;

    const activeGroup = portalGroup(currentSection);
    const hoverGroup = hoveredSection ? portalGroup(hoveredSection) : null;
    const lookKey = hoverGroup ?? (activeGroup !== "main" ? activeGroup : null);
    const fixedLook = lookKey ? LOOK_DIRS[lookKey] : null;

    if (fixedLook) {
      let diff = fixedLook.bodyY - groupRef.current.rotation.y;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
      headRef.current.rotation.x +=
        (fixedLook.headX - headRef.current.rotation.x) * 0.1;
      headRef.current.rotation.y *= 0.85;
      return;
    }

    // Free cursor tracking
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
    const charNDC = charWorld.clone().project(camera);
    const dy = pointer.y - charNDC.y;
    const targetHeadX = THREE.MathUtils.clamp(-dy * 0.8, -0.5, 0.5);
    headRef.current.rotation.x +=
      (targetHeadX - headRef.current.rotation.x) * 0.08;
    headRef.current.rotation.y *= 0.9;
  });

  // Idle damping (legs settle when not walking)
  useFrame(() => {
    if (isWalking) return;
    if (bodyRef.current) bodyRef.current.position.y *= 0.9;
    if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.9;
    if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.9;
  });

  // ── Walk back to home when overlay closes ───────────────────
  useEffect(() => {
    if (
      currentSection === "main" &&
      characterNodeId !== "home" &&
      !isWalking &&
      !walkTarget
    ) {
      const timer = setTimeout(() => {
        const returnPath = findPath(characterNodeId, "home", ringRotation);
        if (returnPath && returnPath.length >= 2) {
          setWalkPath(returnPath);
        } else {
          setCharacterNodeId("home");
          const homeNode = getNode("home");
          if (homeNode && groupRef.current) {
            groupRef.current.position.set(...homeNode.position);
          }
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentSection, characterNodeId, isWalking, walkTarget, ringRotation, setWalkPath, setCharacterNodeId]);

  // ── Sync position to current node when not walking ─────────
  useEffect(() => {
    const node = getNode(characterNodeId);
    if (node && groupRef.current && !isWalking) {
      groupRef.current.position.set(...node.position);
    }
  }, [characterNodeId, isWalking]);

  // ── Geometry ───────────────────────────────────────────────
  return (
    <group ref={groupRef} position={[0, 7.05, 0]}>
      <group ref={bodyRef}>
        {/* Legs */}
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

        {/* Dress / body */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.13, 0.22, 0.6, 8]} />
          <meshStandardMaterial color={COL.dress} {...GD} />
        </mesh>

        {/* Dress accent band */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.215, 0.22, 0.035, 8]} />
          <meshStandardMaterial
            color={COL.band}
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Head group */}
        <group ref={headRef} position={[0, 0.95, 0]}>
          {/* Face */}
          <mesh>
            <sphereGeometry args={[0.17, 14, 14]} />
            <meshStandardMaterial
              color={COL.skin}
              emissive={COL.skin}
              emissiveIntensity={0.12}
            />
          </mesh>

          {/* Hair cap */}
          <mesh position={[0, 0.01, -0.06]}>
            <sphereGeometry args={[0.19, 16, 16]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

          {/* Long hair — left */}
          <mesh position={[0.14, -0.06, -0.02]}>
            <boxGeometry args={[0.06, 0.26, 0.12]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>
          <mesh position={[0.13, -0.24, -0.02]}>
            <boxGeometry args={[0.05, 0.14, 0.1]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

          {/* Long hair — right */}
          <mesh position={[-0.14, -0.06, -0.02]}>
            <boxGeometry args={[0.06, 0.26, 0.12]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>
          <mesh position={[-0.13, -0.24, -0.02]}>
            <boxGeometry args={[0.05, 0.14, 0.1]} />
            <meshStandardMaterial color={COL.hair} />
          </mesh>

          {/* Long hair — back */}
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
