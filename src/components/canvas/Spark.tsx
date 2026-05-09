"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { SeedSpark } from "@/lib/seed-sparks";
import type { GlowColor } from "@/lib/store";

export type MomentMeta = {
  id: string;
  words: string;
  color: GlowColor;
  artifactUrl?: string;
  handle?: string;
};

type Props = {
  spark: SeedSpark;
  bornAt?: number;
  dimTo?: number;
  /** If provided, pointer events are enabled and the hover card fires. */
  moment?: MomentMeta;
  onHover?: (meta: MomentMeta, x: number, y: number) => void;
  onHoverEnd?: () => void;
};

const GLOW_DURATION_MS = 12_000;
const BURST_DURATION_MS = 1_400;

export function Spark({ spark, bornAt, dimTo = 1, moment, onHover, onHoverEnd }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const burstRef = useRef<THREE.Mesh>(null);
  const burstDone = useRef(false);
  const dim = useRef(1);

  const color = new THREE.Color().setHSL(spark.hue / 360, 1, 0.65);

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.x =
        spark.x + Math.sin(t * spark.driftSpeed + spark.phase) * 0.18;
      groupRef.current.position.y =
        spark.y + Math.cos(t * spark.driftSpeed * 0.7 + spark.phase) * 0.18;
    }

    dim.current += (dimTo - dim.current) * 0.04;

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

    const totalMult = glowMult * dim.current;
    const pulse = 0.88 + Math.sin(t * 1.4 + spark.phase) * 0.12;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse * scaleMult);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, totalMult);
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, spark.intensity * 0.22 * totalMult);
      haloRef.current.scale.setScalar(scaleMult);
    }
    if (midRef.current) {
      const mat = midRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, spark.intensity * 0.55 * totalMult);
      midRef.current.scale.setScalar(scaleMult);
    }

    // Birth burst ring — billboard, expands and fades once
    if (bornAt && burstRef.current && !burstDone.current) {
      const age = (Date.now() - bornAt) / BURST_DURATION_MS;
      if (age >= 1) {
        burstDone.current = true;
        burstRef.current.visible = false;
      } else {
        const eased = 1 - Math.pow(1 - age, 2.5);
        burstRef.current.scale.setScalar(1 + eased * 6);
        const mat = burstRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - age) * 0.55;
        burstRef.current.quaternion.copy(camera.quaternion);
      }
    }
  });

  const pointerHandlers = moment
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (moment && onHover) onHover(moment, e.nativeEvent.clientX, e.nativeEvent.clientY);
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          onHoverEnd?.();
          document.body.style.cursor = "";
        },
        onPointerMove: (e: ThreeEvent<PointerEvent>) => {
          if (moment && onHover) onHover(moment, e.nativeEvent.clientX, e.nativeEvent.clientY);
        },
      }
    : {};

  const r = spark.radius;

  return (
    <group ref={groupRef} position={[spark.x, spark.y, spark.z]} {...pointerHandlers}>
      {/* Birth burst ring — only mounted for freshly conjured sparks */}
      {bornAt && (
        <mesh ref={burstRef} renderOrder={0}>
          <ringGeometry args={[r * 1.1, r * 1.6, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.55}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

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
