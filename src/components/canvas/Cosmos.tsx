"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Spark } from "./Spark";
import { CustomControls } from "./CustomControls";
import { generateSeedSparks } from "@/lib/seed-sparks";
import { useStore, GLOW_HUES, type UserSpark } from "@/lib/store";

export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(160), []);
  const userSparks = useStore((s) => s.userSparks);
  const dbSparks = useStore((s) => s.dbSparks);
  const loadMoments = useStore((s) => s.loadMoments);
  const viewMode = useStore((s) => s.viewMode);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  const backgroundSparks = dbSparks.length > 0 ? dbSparks : sparks;
  const sessionIds = new Set(userSparks.map((s) => s.id));

  // In constellation view, anything that isn't yours fades way down
  const backgroundDimTo = viewMode === "constellation" ? 0.12 : 1;

  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
      }}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = "none";
      }}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 35, 90]} />

      {backgroundSparks
        .filter((s) => !sessionIds.has(s.id))
        .map((s) => (
          <Spark key={s.id} spark={toSeedShape(s)} dimTo={backgroundDimTo} />
        ))}

      {userSparks.map((s) => (
        <Spark
          key={s.id}
          spark={{
            id: s.id,
            x: s.x,
            y: s.y,
            z: s.z,
            hue: s.hue,
            radius: s.radius,
            driftSpeed: s.driftSpeed,
            phase: s.phase,
            intensity: 1,
            handle: "your light",
          }}
          bornAt={s.createdAt}
        />
      ))}

      <ConjureCommitter />
      <CameraAnimator />
      <CustomControls minDistance={4} maxDistance={60} />
    </Canvas>
  );
}

function toSeedShape(s: {
  id: string;
  x: number;
  y: number;
  z: number;
  hue: number;
  radius: number;
  driftSpeed: number;
  phase: number;
  intensity?: number;
}) {
  return {
    id: s.id,
    x: s.x,
    y: s.y,
    z: s.z,
    hue: s.hue,
    radius: s.radius,
    driftSpeed: s.driftSpeed,
    phase: s.phase,
    intensity: s.intensity ?? 1,
    handle: "a light in the cosmos",
  };
}

/**
 * Tweens the camera between the wide Cosmos view and the tight Constellation
 * view whenever viewVersion bumps. Skips the very first mount so the initial
 * camera placement isn't overridden by a self-targeted no-op animation.
 */
function CameraAnimator() {
  const { camera } = useThree();
  const viewVersion = useStore((s) => s.viewVersion);
  const setTransitioning = useStore((s) => s._setTransitioning);

  const startPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const startedAt = useRef<number | null>(null);
  const hasMounted = useRef(false);
  const DURATION_MS = 2200;

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const { viewMode, userSparks } = useStore.getState();
    let tx = 0,
      ty = 0,
      tz = 18;
    if (viewMode === "constellation") {
      if (userSparks.length > 0) {
        tx = userSparks.reduce((a, s) => a + s.x, 0) / userSparks.length;
        ty = userSparks.reduce((a, s) => a + s.y, 0) / userSparks.length;
        tz = 8;
      } else {
        tx = 0;
        ty = 0;
        tz = 10;
      }
    }
    targetPos.current.set(tx, ty, tz);
    startPos.current.copy(camera.position);
    startedAt.current = Date.now();
    setTransitioning(true);
  }, [viewVersion, camera, setTransitioning]);

  useFrame(() => {
    if (startedAt.current === null) return;
    // External cancellation (rare — controls are locked, but defensive)
    if (!useStore.getState().isTransitioning) {
      startedAt.current = null;
      return;
    }
    const t = Math.min(1, (Date.now() - startedAt.current) / DURATION_MS);
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
    camera.position.lerpVectors(startPos.current, targetPos.current, eased);
    if (t >= 1) {
      camera.position.copy(targetPos.current);
      startedAt.current = null;
      setTransitioning(false);
    }
  });

  return null;
}

/**
 * Places a new spark at the camera's current view center on conjure.
 */
function ConjureCommitter() {
  const { camera } = useThree();
  const pending = useStore((s) => s.pendingConjure);
  const commit = useStore((s) => s.commitSpark);

  useEffect(() => {
    if (!pending) return;
    const jitter = () => (Math.random() - 0.5) * 1.4;
    const newSpark: UserSpark = {
      id: crypto.randomUUID(),
      words: pending.words,
      color: pending.color,
      hue: GLOW_HUES[pending.color],
      x: camera.position.x + jitter(),
      y: camera.position.y + jitter(),
      z: jitter() * 0.6,
      radius: 0.18 + Math.random() * 0.08,
      driftSpeed: 0.25 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      createdAt: Date.now(),
    };
    commit(newSpark);
  }, [pending, camera, commit]);

  return null;
}
