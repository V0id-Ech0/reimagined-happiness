"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SeedSpark } from "@/lib/seed-sparks";

type Props = {
  spark: SeedSpark;
};

/**
 * A single luminous node — base form is a soft glowing orb that drifts
 * gently in place. Future evolution: shape morphs from logged input,
 * glow fades with time, particle artifact replaces the simple sphere.
 */
export function Spark({ spark }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const color = new THREE.Color().setHSL(spark.hue / 360, 0.55, 0.65);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      const drift = Math.sin(t * spark.driftSpeed + spark.phase);
      const drift2 = Math.cos(t * spark.driftSpeed * 0.7 + spark.phase);
      groupRef.current.position.x = spark.x + drift * 0.15;
      groupRef.current.position.y = spark.y + drift2 * 0.15;
    }
    if (innerRef.current) {
      const pulse = 0.85 + Math.sin(t * 1.2 + spark.phase) * 0.15;
      innerRef.current.scale.setScalar(pulse);
    }
    if (haloRef.current) {
      const breath = 1 + Math.sin(t * 0.6 + spark.phase) * 0.08;
      haloRef.current.scale.setScalar(breath);
    }
  });

  return (
    <group ref={groupRef} position={[spark.x, spark.y, spark.z]}>
      {/* Outer halo — soft, low-opacity */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[spark.radius * 4, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[spark.radius * 2.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[spark.radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={Math.min(1, spark.intensity * 0.95)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
