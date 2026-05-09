"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import { Spark } from "./Spark";
import { generateSeedSparks } from "@/lib/seed-sparks";

export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(160), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      // touch-action:none is critical — without it, trackpad and touch
      // gestures are eaten by the browser before reaching the canvas.
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
        cursor: "grab",
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

      {/* MapControls = OrbitControls preset for 2D pan/zoom: LEFT pans,
          rotation disabled, screenSpacePanning on. Defaults are correct. */}
      <MapControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={4}
        maxDistance={60}
        panSpeed={0.9}
        zoomSpeed={0.85}
      />
    </Canvas>
  );
}
