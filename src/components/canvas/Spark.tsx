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

// Shared star-flare texture — created once, tinted per-spark via SpriteMaterial.color
let _flareTexture: THREE.CanvasTexture | null = null;
function getFlareTexture(): THREE.CanvasTexture {
  if (_flareTexture) return _flareTexture;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;

  // 4 crossing rays at 0°, 45°, 90°, 135°
  const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
  for (const angle of angles) {
    const dx = Math.cos(angle) * c * 0.96;
    const dy = Math.sin(angle) * c * 0.96;
    const grad = ctx.createLinearGradient(c - dx, c - dy, c + dx, c + dy);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.38, "rgba(255,255,255,0.04)");
    grad.addColorStop(0.5, "rgba(255,255,255,1)");
    grad.addColorStop(0.62, "rgba(255,255,255,0.04)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(c - dx, c - dy);
    ctx.lineTo(c + dx, c + dy);
    ctx.stroke();
  }

  // Soft bloom at centre — gives the rays a natural hotspot
  const bloom = ctx.createRadialGradient(c, c, 0, c, c, c * 0.38);
  bloom.addColorStop(0, "rgba(255,255,255,0.95)");
  bloom.addColorStop(0.5, "rgba(255,255,255,0.25)");
  bloom.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, size, size);

  _flareTexture = new THREE.CanvasTexture(canvas);
  return _flareTexture;
}

export function Spark({ spark, bornAt, dimTo = 1, moment, onHover, onHoverEnd }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Sprite>(null);
  const flareMatRef = useRef<THREE.SpriteMaterial>(null);
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

    // Two overlapping sines for organic, non-mechanical breathing
    const pulse =
      0.82 +
      Math.sin(t * 1.4 + spark.phase) * 0.1 +
      Math.sin(t * 3.3 + spark.phase * 1.7) * 0.05;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse * scaleMult);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, totalMult);
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, spark.intensity * 0.22 * totalMult);
      haloRef.current.scale.setScalar(pulse * scaleMult);
    }
    if (midRef.current) {
      const mat = midRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, spark.intensity * 0.55 * totalMult);
      midRef.current.scale.setScalar(pulse * scaleMult);
    }

    // Star flare — slow rotation makes it feel alive, not static
    if (flareRef.current && flareMatRef.current) {
      const flareScale = spark.radius * 14 * scaleMult;
      flareRef.current.scale.set(flareScale, flareScale, 1);
      flareMatRef.current.rotation = t * 0.09 + spark.phase;
      flareMatRef.current.opacity = Math.min(
        0.6,
        spark.intensity * 0.38 * totalMult * pulse,
      );
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

      {/* Star flare — auto-faces camera, slow rotation, tinted by spark color */}
      <sprite ref={flareRef} renderOrder={1}>
        <spriteMaterial
          ref={flareMatRef}
          map={getFlareTexture()}
          color={color}
          transparent
          opacity={spark.intensity * 0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>

      <mesh ref={haloRef} renderOrder={2}>
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

      <mesh ref={midRef} renderOrder={3}>
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

      <mesh ref={coreRef} renderOrder={4}>
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
