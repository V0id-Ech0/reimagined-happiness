"use client";

import { motion } from "framer-motion";

/**
 * The Phosphene wordmark. Sits quietly in the top-left.
 * Fades in slowly. Never demands attention.
 */
export function Wordmark() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
      className="pointer-events-none fixed left-6 top-6 z-20"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-medium tracking-[0.2em] text-stone-200">
          PHOSPHENE
        </span>
        <span className="hidden text-[11px] italic tracking-wide text-stone-500/70 sm:inline">
          every moment of happiness leaves a light
        </span>
      </div>
    </motion.div>
  );
}
