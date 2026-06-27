"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BIRD_COLOR = "#3A3A4A";
const ENTER_DURATION = 4;
const PLAY_DURATION = 10;
const EXIT_DURATION = 4;
const FLOCK_DURATION = ENTER_DURATION + PLAY_DURATION + EXIT_DURATION;
const FIRST_FLOCK_DELAY = 15;
const MIN_INTERVAL = 30;
const MAX_INTERVAL = 60;
const MAX_BIRDS = 3;

type FlockPhase = "enter" | "play" | "exit";

interface FlockConfig {
  count: 2 | 3;
  focal: THREE.Vector3;
  enterFrom: THREE.Vector3;
  exitTo: THREE.Vector3;
  orbitRadius: number;
  orbitSpeed: number;
  wingPhaseOffset: number[];
}

interface BirdInstance {
  group: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  materials: THREE.MeshStandardMaterial[];
  wingPhase: number;
  prevPos: THREE.Vector3;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createFlockConfig(): FlockConfig {
  const count = Math.random() < 0.5 ? 2 : 3;
  const edge = Math.floor(Math.random() * 3);

  const focal = new THREE.Vector3(
    randomBetween(-3, 3),
    randomBetween(10, 14),
    randomBetween(-3, 3),
  );

  let enterFrom: THREE.Vector3;
  let exitTo: THREE.Vector3;

  if (edge === 0) {
    enterFrom = new THREE.Vector3(-22, focal.y + randomBetween(-1, 2), focal.z + randomBetween(-4, 4));
    exitTo = new THREE.Vector3(22, focal.y + randomBetween(-1, 2), focal.z + randomBetween(-4, 4));
  } else if (edge === 1) {
    enterFrom = new THREE.Vector3(focal.x + randomBetween(-4, 4), focal.y + randomBetween(-1, 2), -22);
    exitTo = new THREE.Vector3(focal.x + randomBetween(-4, 4), focal.y + randomBetween(-1, 2), 22);
  } else {
    enterFrom = new THREE.Vector3(22, focal.y + randomBetween(-1, 2), focal.z + randomBetween(-4, 4));
    exitTo = new THREE.Vector3(-22, focal.y + randomBetween(-1, 2), focal.z + randomBetween(-4, 4));
  }

  return {
    count,
    focal,
    enterFrom,
    exitTo,
    orbitRadius: randomBetween(1.4, 2.2),
    orbitSpeed: randomBetween(0.7, 1.1),
    wingPhaseOffset: Array.from({ length: count }, (_, i) => i * 1.3 + Math.random() * 0.5),
  };
}

function createBirdMesh(wingPhase: number): BirdInstance {
  const materials: THREE.MeshStandardMaterial[] = [];
  const mat = () => {
    const m = new THREE.MeshStandardMaterial({
      color: BIRD_COLOR,
      transparent: true,
      opacity: 1,
      roughness: 0.9,
    });
    materials.push(m);
    return m;
  };

  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1, 8, 6),
    mat(),
  );
  body.scale.set(0.35, 0.18, 0.55);
  group.add(body);

  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.22), mat());
  leftWing.position.set(-0.28, 0.02, 0);
  leftWing.rotation.z = 0.2;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.22), mat());
  rightWing.position.set(0.28, 0.02, 0);
  rightWing.rotation.z = -0.2;
  group.add(rightWing);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), mat());
  beak.position.set(0.42, 0.04, 0);
  beak.rotation.z = -Math.PI / 2;
  group.add(beak);

  return {
    group,
    leftWing,
    rightWing,
    materials,
    wingPhase,
    prevPos: new THREE.Vector3(),
  };
}

export default function BirdSpawner() {
  const rootRef = useRef<THREE.Group>(null);
  const birdsRef = useRef<BirdInstance[]>([]);
  const configRef = useRef<FlockConfig>(createFlockConfig());
  const activeRef = useRef(false);
  const spawnStartRef = useRef(0);
  const nextSpawnAtRef = useRef(FIRST_FLOCK_DELAY);
  const orbitAngleRef = useRef(0);
  const initializedRef = useRef(false);

  const lookTarget = useRef(new THREE.Vector3());
  const center = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    const root = rootRef.current;
    if (!root) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      for (let i = 0; i < MAX_BIRDS; i++) {
        const bird = createBirdMesh(i * 1.3);
        birdsRef.current.push(bird);
        root.add(bird.group);
        bird.group.visible = false;
      }
    }

    const t = clock.elapsedTime;

    if (!activeRef.current) {
      birdsRef.current.forEach((bird) => {
        bird.group.visible = false;
      });
      if (t >= nextSpawnAtRef.current) {
        activeRef.current = true;
        spawnStartRef.current = t;
        orbitAngleRef.current = 0;
        configRef.current = createFlockConfig();
      }
      return;
    }

    const flockTime = t - spawnStartRef.current;
    const config = configRef.current;

    if (flockTime >= FLOCK_DURATION) {
      activeRef.current = false;
      nextSpawnAtRef.current = t + randomBetween(MIN_INTERVAL, MAX_INTERVAL);
      birdsRef.current.forEach((bird) => {
        bird.group.visible = false;
      });
      return;
    }

    let phase: FlockPhase;
    let phaseT: number;

    if (flockTime < ENTER_DURATION) {
      phase = "enter";
      phaseT = flockTime / ENTER_DURATION;
    } else if (flockTime < ENTER_DURATION + PLAY_DURATION) {
      phase = "play";
      phaseT = (flockTime - ENTER_DURATION) / PLAY_DURATION;
    } else {
      phase = "exit";
      phaseT = (flockTime - ENTER_DURATION - PLAY_DURATION) / EXIT_DURATION;
    }

    const opacity =
      phase === "enter"
        ? easeInOut(Math.min(phaseT / 0.35, 1))
        : phase === "exit"
          ? 1 - easeInOut(phaseT)
          : 1;

    if (phase === "enter") {
      center.current.copy(config.enterFrom).lerp(config.focal, easeInOut(phaseT));
    } else if (phase === "play") {
      orbitAngleRef.current += config.orbitSpeed * delta;
      const figure8X = Math.sin(orbitAngleRef.current * 0.5) * 1.2;
      const figure8Z = Math.sin(orbitAngleRef.current) * 0.8;
      center.current.copy(config.focal).add(new THREE.Vector3(figure8X, 0, figure8Z));
    } else {
      center.current.copy(config.focal).lerp(config.exitTo, easeInOut(phaseT));
    }

    for (let i = 0; i < MAX_BIRDS; i++) {
      const bird = birdsRef.current[i];
      if (!bird) continue;

      const isActive = i < config.count;
      bird.group.visible = isActive;
      if (!isActive) continue;

      const angle = orbitAngleRef.current + (i * Math.PI * 2) / config.count;
      const bob = phase === "play" ? Math.sin(flockTime * 2 + i) * 0.3 : 0;
      const spread = phase === "play" ? config.orbitRadius : config.orbitRadius * 0.35;

      pos.current.set(
        center.current.x + Math.cos(angle) * spread,
        center.current.y + bob,
        center.current.z + Math.sin(angle) * spread,
      );

      if (bird.group.position.distanceTo(bird.prevPos) > 0.001) {
        lookTarget.current.copy(pos.current).add(
          pos.current.clone().sub(bird.prevPos).normalize(),
        );
        bird.group.lookAt(lookTarget.current);
      }

      bird.prevPos.copy(pos.current);
      bird.group.position.copy(pos.current);

      const flap = Math.sin(t * 8 + bird.wingPhase) * 0.55;
      bird.leftWing.rotation.z = flap + 0.2;
      bird.rightWing.rotation.z = -flap - 0.2;

      bird.materials.forEach((mat) => {
        mat.opacity = opacity;
      });
    }
  });

  return <group ref={rootRef} />;
}
