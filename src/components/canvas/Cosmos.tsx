"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Spark } from "./Spark";
import { generateSeedSparks } from "@/lib/seed-sparks";

export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(160), []);

  return (
    <div style={{ width: "100%", height: "100%", cursor: "grab" }}>
      <Canvas
        camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050507"]} />
        <fog attach="fog" args={["#050507", 35, 90]} />

        {sparks.map((s) => (
          <Spark key={s.id} spark={s} />
        ))}

        <OrbitControls
          makeDefault
          enableRotate={false}
          enableDamping
          dampingFactor={0.07}
          screenSpacePanning
          panSpeed={0.9}
          zoomSpeed={0.85}
          minDistance={4}
          maxDistance={60}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </div>
  );
}
