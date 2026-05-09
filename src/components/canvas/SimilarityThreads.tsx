"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SimilarPair } from "@/lib/supabase/similarity";

type SparkPos = { x: number; y: number; z: number };

type Props = {
  pairs: SimilarPair[];
  /** Map from spark id → base position */
  positions: Record<string, SparkPos>;
};

// Raised to 60 so sparks spread across the cosmos still connect
const MAX_THREAD_DISTANCE = 60;

export function SimilarityThreads({ pairs, positions }: Props) {
  const coreRef = useRef<THREE.LineBasicMaterial>(null);
  const glowRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const pts: number[] = [];

    for (const { idA, idB } of pairs) {
      const a = positions[idA];
      const b = positions[idB];
      if (!a || !b) continue;

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) > MAX_THREAD_DISTANCE) continue;

      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, [pairs, positions]);

  useFrame(({ clock }) => {
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 0.4) * 0.15;
    if (coreRef.current) coreRef.current.opacity = pulse;
    if (glowRef.current) glowRef.current.opacity = pulse * 0.28;
  });

  if (pairs.length === 0) return null;

  return (
    <>
      {/* Outer glow layer — same geometry, softer colour, lower opacity */}
      <lineSegments geometry={geometry} renderOrder={0}>
        <lineBasicMaterial
          ref={glowRef}
          color="#9d8fff"
          transparent
          opacity={0.14}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>

      {/* Core line — bright white-violet, high opacity */}
      <lineSegments geometry={geometry} renderOrder={1}>
        <lineBasicMaterial
          ref={coreRef}
          color="#e8e4ff"
          transparent
          opacity={0.5}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </>
  );
}
