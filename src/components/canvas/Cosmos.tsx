"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Spark } from "./Spark";
import { generateSeedSparks } from "@/lib/seed-sparks";

/**
 * The infinite dark canvas — first impression. Renders the collective cosmos
 * in motion. Camera is fixed for now; zoom + pan controls come next, then the
 * continuous-zoom transition into the personal constellation.
 */
export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(80), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 18, 40]} />
      {sparks.map((s) => (
        <Spark key={s.id} spark={s} />
      ))}
    </Canvas>
  );
}
