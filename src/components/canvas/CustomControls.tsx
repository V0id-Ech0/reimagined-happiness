"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  minDistance?: number;
  maxDistance?: number;
  damping?: number;
};

/**
 * Custom 2D pan + zoom controls. Bypasses drei's OrbitControls/MapControls
 * to avoid any abstraction layer that might be eating events. Pure DOM events
 * straight to the canvas, with smooth damping/momentum.
 */
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
    const dom = gl.domElement;
    dom.style.touchAction = "none";

    console.log("[phosphene] controls attached to", dom);

    const onPointerDown = (e: PointerEvent) => {
      console.log("[phosphene] pointer down");
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      try {
        dom.setPointerCapture(e.pointerId);
      } catch {
        // ignore — capture sometimes fails in dev tools
      }
      dom.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      // Scale pan velocity with camera distance so it feels right at any zoom
      const dist = camera.position.length();
      const factor = dist * 0.0018;
      velocity.current.x -= dx * factor;
      velocity.current.y += dy * factor;
    };

    const onPointerUp = (e: PointerEvent) => {
      console.log("[phosphene] pointer up");
      dragging.current = false;
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      dom.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      console.log("[phosphene] wheel", e.deltaY);
      // Accumulate zoom velocity for smooth feel
      zoomVelocity.current += e.deltaY * 0.001;
    };

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);
    dom.addEventListener("pointerleave", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.style.cursor = "grab";

    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("pointerleave", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
    };
  }, [camera, gl]);

  useFrame(() => {
    // Apply pan velocity with damping
    camera.position.x += velocity.current.x;
    camera.position.y += velocity.current.y;
    velocity.current.x *= damping;
    velocity.current.y *= damping;
    if (Math.abs(velocity.current.x) < 0.0001) velocity.current.x = 0;
    if (Math.abs(velocity.current.y) < 0.0001) velocity.current.y = 0;

    // Apply zoom with damping, exponential feel
    if (Math.abs(zoomVelocity.current) > 0.0001) {
      const factor = Math.exp(zoomVelocity.current);
      const target = new THREE.Vector3(camera.position.x, camera.position.y, 0);
      const dir = camera.position.clone().sub(target);
      const newLen = THREE.MathUtils.clamp(
        dir.length() * factor,
        minDistance,
        maxDistance,
      );
      camera.position.copy(target.clone().add(dir.normalize().multiplyScalar(newLen)));
      zoomVelocity.current *= 0.85;
    } else {
      zoomVelocity.current = 0;
    }
  });

  return null;
}
