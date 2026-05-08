"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A single, subtle invitation to explore. Appears after a beat,
 * vanishes the moment the user does anything.
 */
export function CanvasHint() {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const dismiss = () => setHasInteracted(true);
    window.addEventListener("pointerdown", dismiss, { once: true });
    window.addEventListener("wheel", dismiss, { once: true });
    window.addEventListener("touchstart", dismiss, { once: true });
    window.addEventListener("keydown", dismiss, { once: true });
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, []);

  return (
    <AnimatePresence>
      {!hasInteracted && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.55, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          transition={{ duration: 1.6, delay: 2.4, ease: "easeOut" }}
          className="pointer-events-none fixed right-6 top-6 z-10 select-none text-[10px] font-light uppercase tracking-[0.25em] text-stone-400"
        >
          drag · scroll to zoom
        </motion.div>
      )}
    </AnimatePresence>
  );
}
