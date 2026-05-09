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

const MAX_THREAD_DISTANCE = 32;

export function SimilarityThreads({ pairs, positions }: Props) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const pts: number[] = [];

    for (const { idA, idB } of pairs) {
      const a = positions[idA];
      const b = positions[idB];
      if (!a || !b) continue;

      // Don't draw threads between sparks that are very far apart —
      // spanning the whole canvas would look like noise, not meaning.
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

  // Slow global pulse — gives the threads life without distracting
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.opacity =
        0.055 + Math.sin(clock.elapsedTime * 0.35) * 0.025;
    }
  });

  if (pairs.length === 0) return null;

  return (
    <lineSegments geometry={geometry} renderOrder={0}>
      <lineBasicMaterial
        ref={matRef}
        color="#e8e4ff"
        transparent
        opacity={0.055}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}
