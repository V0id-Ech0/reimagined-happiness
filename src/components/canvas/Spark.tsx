"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SeedSpark } from "@/lib/seed-sparks";

type Props = {
  spark: SeedSpark;
  /** Wall-clock ms when this spark was born — drives the bright→settled glow phase */
  bornAt?: number;
};

const GLOW_DURATION_MS = 12_000;

export function Spark({ spark, bornAt }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);

  const color = new THREE.Color().setHSL(spark.hue / 360, 1, 0.65);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.x =
        spark.x + Math.sin(t * spark.driftSpeed + spark.phase) * 0.18;
      groupRef.current.position.y =
        spark.y + Math.cos(t * spark.driftSpeed * 0.7 + spark.phase) * 0.18;
    }

    let glowMult = 1;
    let scaleMult = 1;
    if (bornAt) {
      const age = (Date.now() - bornAt) / GLOW_DURATION_MS;
      if (age < 1) {
        const eased = 1 - Math.pow(age, 0.6);
        glowMult = 1 + eased * 2.4;
        scaleMult = 1 + eased * 0.7;
      }
    }

    const pulse = 0.88 + Math.sin(t * 1.4 + spark.phase) * 0.12;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse * scaleMult);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, glowMult);
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, spark.intensity * 0.22 * glowMult);
      haloRef.current.scale.setScalar(scaleMult);
    }
    if (midRef.current) {
      const mat = midRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, spark.intensity * 0.55 * glowMult);
      midRef.current.scale.setScalar(scaleMult);
    }
  });

  const r = spark.radius;

  return (
    <group ref={groupRef} position={[spark.x, spark.y, spark.z]}>
      <mesh ref={haloRef} renderOrder={1}>
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

      <mesh ref={midRef} renderOrder={2}>
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
