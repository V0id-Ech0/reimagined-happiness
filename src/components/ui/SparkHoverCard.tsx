"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";

const CARD_W = 236; // max-w-[220px] + p-3 on each side
const CARD_H_EST = 210;
const EDGE_PAD = 10;

export function SparkHoverCard() {
  const hovered = useStore((s) => s.hoveredMoment);

  if (!hovered) return <AnimatePresence />;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

  // Prefer right of cursor; flip left if it would overflow
  const rawLeft = hovered.x + 16;
  const left =
    rawLeft + CARD_W > vw - EDGE_PAD ? hovered.x - CARD_W - 8 : rawLeft;
  // Prefer above baseline; clamp bottom
  const top = Math.min(hovered.y - 12, vh - CARD_H_EST - EDGE_PAD);

  return (
    <AnimatePresence>
      <motion.div
        key={hovered.id}
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-none fixed z-40 max-w-[220px]"
        style={{ left, top }}
      >
        <div className="rounded-xl border border-white/10 bg-void-900/90 p-3 shadow-2xl backdrop-blur-xl">
          {hovered.artifactUrl && (
            <div className="mb-2.5 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hovered.artifactUrl}
                alt=""
                className="h-28 w-full object-cover opacity-90"
              />
            </div>
          )}
          <p className="text-[12px] font-light leading-relaxed tracking-wide text-stone-300">
            {hovered.words}
          </p>
          {hovered.handle && (
            <p className="mt-2 text-[10px] font-light tracking-widest text-stone-500 uppercase">
              {hovered.handle}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
