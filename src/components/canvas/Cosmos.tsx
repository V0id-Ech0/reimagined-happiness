"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import * as THREE from "three";
import { Spark } from "./Spark";
import { generateSeedSparks } from "@/lib/seed-sparks";

/**
 * The infinite dark canvas — first impression. Renders the collective cosmos
 * in motion. Pan with drag, zoom with scroll/pinch. Damping gives weight and
 * momentum so movement feels graceful, never twitchy.
 */
export function Cosmos() {
  const sparks = useMemo(() => generateSeedSparks(160), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ cursor: "grab" }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).style.cursor = "grabbing";
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLElement).style.cursor = "grab";
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLElement).style.cursor = "grab";
      }}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 30, 80]} />

      {sparks.map((s) => (
        <Spark key={s.id} spark={s} />
      ))}

      <MapControls
        // Drift, weight, momentum
        enableDamping
        dampingFactor={0.08}
        // 2D-feeling pan along the camera plane
        screenSpacePanning
        // No rotation — orientation stays fixed for a stable cosmos
        enableRotate={false}
        // Reasonable zoom limits so you never get fully lost
        minDistance={4}
        maxDistance={60}
        // Smooth, responsive feel
        panSpeed={1}
        zoomSpeed={0.9}
        // One finger drags, two fingers pinch-zoom + pan
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
        // Left and right both pan; middle (or scroll) zooms
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </Canvas>
  );
}
