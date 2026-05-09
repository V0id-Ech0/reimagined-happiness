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
  const dbSparks = useStore((s) => s.dbSparks);
  const loadMoments = useStore((s) => s.loadMoments);

  // Load the shared cosmos from Supabase once on mount
  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  // DB sparks replace seed sparks once data arrives; seed sparks fill the void
  const backgroundSparks = dbSparks.length > 0 ? dbSparks : sparks;

  // IDs of sparks already glowing in userSparks — skip them in the background layer
  const sessionIds = new Set(userSparks.map((s) => s.id));

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
          <Spark
            key={s.id}
            spark={toSeedShape(s)}
          />
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

/** Maps any spark shape (SeedSpark or UserSpark) to the SeedSpark form Spark expects. */
function toSeedShape(s: { id: string; x: number; y: number; z: number; hue: number; radius: number; driftSpeed: number; phase: number; intensity?: number }) {
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
