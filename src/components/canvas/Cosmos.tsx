"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Spark } from "./Spark";
import { CustomControls } from "./CustomControls";
import { generateSeedSparks } from "@/lib/seed-sparks";

export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(160), []);

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
        console.log("[phosphene] canvas created", gl.domElement);
      }}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 35, 90]} />

      {sparks.map((s) => (
        <Spark key={s.id} spark={s} />
      ))}

      <CustomControls minDistance={4} maxDistance={60} />
    </Canvas>
  );
}
