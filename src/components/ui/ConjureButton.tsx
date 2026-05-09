"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function ConjureButton() {
  const openConjure = useStore((s) => s.openConjure);

  return (
    <motion.button
      onClick={openConjure}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="pointer-events-auto fixed bottom-6 right-6 z-20 group"
      aria-label="Add a moment of happiness"
    >
      <span className="absolute inset-0 rounded-full bg-glow-warm/10 blur-xl transition group-hover:bg-glow-warm/20" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-void-900/70 text-stone-200 backdrop-blur-md transition group-hover:border-white/30 group-hover:text-white">
        <PlusGlyph />
      </span>
    </motion.button>
  );
}

function PlusGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-90"
    >
      <path
        d="M7 1V13M1 7H13"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
