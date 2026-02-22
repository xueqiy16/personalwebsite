"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { useStore, type Section } from "@/store/useStore";

const CAMERA_TARGETS: Record<
  Section,
  { pos: [number, number, number]; zoom: number }
> = {
  main: { pos: [0, -5.5, 0], zoom: 45 },

  arts: { pos: [0, -1.5, -2.1], zoom: 80 },
  dance: { pos: [0, -1.5, -2.1], zoom: 80 },
  gymnastics: { pos: [0, -1.5, -2.1], zoom: 80 },
  music: { pos: [0, -1.5, -2.1], zoom: 80 },

  projects: { pos: [-2.1, -1.5, 0], zoom: 80 },
  articles: { pos: [-2.1, -1.5, 0], zoom: 80 },
  xposts: { pos: [-2.1, -1.5, 0], zoom: 80 },
  pastprojects: { pos: [-2.1, -1.5, 0], zoom: 80 },

  about: { pos: [0, -9, 0], zoom: 70 },
};

const DESKTOP_ZOOM = 45;

interface CameraControllerProps {
  groupRef: React.RefObject<THREE.Group | null>;
  baseZoom?: number;
}

export default function CameraController({
  groupRef,
  baseZoom = DESKTOP_ZOOM,
}: CameraControllerProps) {
  const camera = useThree((s) => s.camera);
  const currentSection = useStore((s) => s.currentSection);
  const isWalking = useStore((s) => s.isWalking);
  const pendingSection = useRef<Section | null>(null);

  // Queue camera transition while character is walking
  useEffect(() => {
    if (currentSection === "main") {
      // Always transition back to main immediately
      applyTransition(currentSection);
      pendingSection.current = null;
      return;
    }

    if (isWalking) {
      pendingSection.current = currentSection;
      return;
    }

    applyTransition(currentSection);
    pendingSection.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection]);

  // When walking stops, fire the pending camera transition
  useEffect(() => {
    if (!isWalking && pendingSection.current) {
      applyTransition(pendingSection.current);
      pendingSection.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalking]);

  function applyTransition(section: Section) {
    const group = groupRef.current;
    if (!group) return;

    const target = CAMERA_TARGETS[section] ?? CAMERA_TARGETS.main;
    const scale = baseZoom / DESKTOP_ZOOM;
    const scaledZoom = target.zoom * scale;

    gsap.to(group.position, {
      x: target.pos[0],
      y: target.pos[1],
      z: target.pos[2],
      duration: 1.2,
      ease: "power2.inOut",
    });

    gsap.to(camera, {
      zoom: scaledZoom,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      },
    });
  }

  return null;
}
