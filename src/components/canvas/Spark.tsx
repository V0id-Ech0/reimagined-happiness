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

  const color = new THREE.Color().setHSL(spark.hue / 360, 0.9, 0.78);

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
      {/* Wide atmosphere — barely there, just warms the void */}
      <mesh>
        <sphereGeometry args={[spark.radius * 7, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Outer halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[spark.radius * 3.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[spark.radius * 2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={spark.intensity * 0.38}
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
          opacity={Math.min(1, spark.intensity * 1.1)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
