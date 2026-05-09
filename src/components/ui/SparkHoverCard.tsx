"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function SparkHoverCard() {
  const hovered = useStore((s) => s.hoveredMoment);

  return (
    <AnimatePresence>
      {hovered && (
        <motion.div
          key={hovered.id}
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none fixed z-40 max-w-[220px]"
          style={{
            left: hovered.x + 16,
            top: hovered.y - 12,
          }}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
