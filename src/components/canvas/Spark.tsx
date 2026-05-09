"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SeedSpark } from "@/lib/seed-sparks";

type Props = { spark: SeedSpark };

export function Spark({ spark }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Vivid, high-saturation color — skipping near-black and near-white hues
  const color = new THREE.Color().setHSL(spark.hue / 360, 1, 0.72);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.x = spark.x + Math.sin(t * spark.driftSpeed + spark.phase) * 0.18;
      groupRef.current.position.y = spark.y + Math.cos(t * spark.driftSpeed * 0.7 + spark.phase) * 0.18;
    }
    if (coreRef.current) {
      const pulse = 0.88 + Math.sin(t * 1.4 + spark.phase) * 0.12;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  const r = spark.radius;

  return (
    <group ref={groupRef} position={[spark.x, spark.y, spark.z]}>
      {/* Outer halo */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[r * 5, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.07}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mid glow */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[r * 2.4, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.35}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Bright core */}
      <mesh ref={coreRef} renderOrder={3}>
        <sphereGeometry args={[r, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={Math.min(1, spark.intensity * 1.2)}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
