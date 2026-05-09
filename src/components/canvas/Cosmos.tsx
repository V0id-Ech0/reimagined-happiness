"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Spark } from "./Spark";
import { CustomControls } from "./CustomControls";
import { generateSeedSparks } from "@/lib/seed-sparks";
import { useStore, GLOW_HUES, type UserSpark } from "@/lib/store";

export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(160), []);
  const userSparks = useStore((s) => s.userSparks);

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

      {sparks.map((s) => (
        <Spark key={s.id} spark={s} />
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
      <CustomControls minDistance={4} maxDistance={60} />
    </Canvas>
  );
}

/**
 * When a Conjure is requested, places the new spark at the camera's current
 * view center (with a small jitter so repeats don't stack), then commits it.
 */
function ConjureCommitter() {
  const { camera } = useThree();
  const pending = useStore((s) => s.pendingConjure);
  const commit = useStore((s) => s.commitSpark);

  useEffect(() => {
    if (!pending) return;
    const jitter = () => (Math.random() - 0.5) * 1.4;
    const newSpark: UserSpark = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
