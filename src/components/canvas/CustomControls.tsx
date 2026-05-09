"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useStore } from "@/lib/store";

type Props = {
  minDistance?: number;
  maxDistance?: number;
  damping?: number;
};

export function CustomControls({
  minDistance = 4,
  maxDistance = 60,
  damping = 0.9,
}: Props) {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const zoomVelocity = useRef(0);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";

    const isLocked = () => useStore.getState().isTransitioning;

    const onPointerDown = (e: PointerEvent) => {
      if (isLocked()) return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      const factor = Math.abs(camera.position.z) * 0.0018;
      velocity.current.x -= dx * factor;
      velocity.current.y += dy * factor;
    };

    const onPointerUp = () => {
      dragging.current = false;
      canvas.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isLocked()) return;
      zoomVelocity.current += e.deltaY * 0.001;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [camera, gl]);

  useFrame(() => {
    // While the CameraAnimator owns the camera, leave it alone
    if (useStore.getState().isTransitioning) {
      velocity.current.x = 0;
      velocity.current.y = 0;
      zoomVelocity.current = 0;
      return;
    }
    camera.position.x += velocity.current.x;
    camera.position.y += velocity.current.y;
    velocity.current.x *= damping;
    velocity.current.y *= damping;
    if (Math.abs(velocity.current.x) < 0.0001) velocity.current.x = 0;
    if (Math.abs(velocity.current.y) < 0.0001) velocity.current.y = 0;

    if (Math.abs(zoomVelocity.current) > 0.0001) {
      const newZ = THREE.MathUtils.clamp(
        camera.position.z * Math.exp(zoomVelocity.current),
        minDistance,
        maxDistance,
      );
      camera.position.z = newZ;
      zoomVelocity.current *= 0.85;
    } else {
      zoomVelocity.current = 0;
    }
  });

  return null;
}
