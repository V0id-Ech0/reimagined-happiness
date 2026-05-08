"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Place = "cosmos" | "constellation";

/**
 * Persistent ambient panel. Always tells you where you are without ever
 * shouting. Minimal, dark, slightly translucent. Will hold the zoom control,
 * the place indicator, and the conjure button.
 */
export function NavPanel() {
  const [place, setPlace] = useState<Place>("cosmos");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto fixed bottom-6 left-1/2 z-20 -translate-x-1/2"
    >
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-void-900/60 p-1 backdrop-blur-md">
        <PlaceTab
          label="The Cosmos"
          active={place === "cosmos"}
          onClick={() => setPlace("cosmos")}
        />
        <PlaceTab
          label="Your Constellation"
          active={place === "constellation"}
          onClick={() => setPlace("constellation")}
        />
      </div>
    </motion.div>
  );
}

function PlaceTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-full px-5 py-2 text-xs tracking-wide text-stone-300 transition-colors hover:text-stone-100"
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="absolute inset-0 rounded-full bg-white/[0.06]"
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}
