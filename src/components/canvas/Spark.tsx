"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SeedSpark } from "@/lib/seed-sparks";

type Props = { spark: SeedSpark };

export function Spark({ spark }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Vivid, high-saturation, bright color — boosted lightness for additive bloom
  const color = new THREE.Color().setHSL(spark.hue / 360, 1, 0.65);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.x =
        spark.x + Math.sin(t * spark.driftSpeed + spark.phase) * 0.18;
      groupRef.current.position.y =
        spark.y + Math.cos(t * spark.driftSpeed * 0.7 + spark.phase) * 0.18;
    }
    if (coreRef.current) {
      const pulse = 0.88 + Math.sin(t * 1.4 + spark.phase) * 0.12;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  const r = spark.radius;

  return (
    <group ref={groupRef} position={[spark.x, spark.y, spark.z]}>
      {/* Outer halo — soft bloom */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[r * 3, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.22}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Mid glow */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[r * 1.7, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.55}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Bright core */}
      <mesh ref={coreRef} renderOrder={3}>
        <sphereGeometry args={[r * 0.95, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={1}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
