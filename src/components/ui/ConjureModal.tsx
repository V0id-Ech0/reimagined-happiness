"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStore, type GlowColor } from "@/lib/store";

const COLORS: { key: GlowColor; hex: string; label: string }[] = [
  { key: "warm", hex: "#ffd9a8", label: "warm" },
  { key: "cool", hex: "#a8d9ff", label: "cool" },
  { key: "rose", hex: "#ff9ec7", label: "rose" },
  { key: "sage", hex: "#9ed4c0", label: "sage" },
  { key: "violet", hex: "#c5a8ff", label: "violet" },
];

export function ConjureModal() {
  const isOpen = useStore((s) => s.isConjureOpen);
  const closeConjure = useStore((s) => s.closeConjure);
  const requestConjure = useStore((s) => s.requestConjure);

  const [words, setWords] = useState("");
  const [color, setColor] = useState<GlowColor>("warm");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWords("");
      setColor("warm");
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConjure();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeConjure]);

  const canSubmit = words.trim().length > 0;

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    requestConjure(words.trim(), color);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-void-950/70 backdrop-blur-md"
          onClick={closeConjure}
        >
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 1.02 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-void-900/80 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                a moment of light
              </span>
              <button
                type="button"
                onClick={closeConjure}
                className="text-stone-500 transition hover:text-stone-200"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="what brought this light?"
              maxLength={140}
              className="w-full border-b border-white/10 bg-transparent pb-3 text-lg font-light tracking-wide text-stone-100 placeholder:text-stone-600 focus:border-white/30 focus:outline-none"
            />

            <div className="mt-8">
              <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-stone-500">
                its color
              </div>
              <div className="flex items-center gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColor(c.key)}
                    aria-label={c.label}
                    className="group relative h-7 w-7 rounded-full transition"
                    style={{
                      boxShadow:
                        color === c.key
                          ? `0 0 0 2px ${c.hex}40, 0 0 16px ${c.hex}80`
                          : "none",
                    }}
                  >
                    <span
                      className="block h-full w-full rounded-full transition group-hover:scale-110"
                      style={{
                        background: c.hex,
                        boxShadow: `0 0 12px ${c.hex}aa`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <span className="text-[11px] italic text-stone-500">
                it will glow, then settle
              </span>
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.04 } : {}}
                whileTap={canSubmit ? { scale: 0.94 } : {}}
                className="relative rounded-full border border-white/15 bg-white/[0.04] px-6 py-2 text-xs uppercase tracking-[0.25em] text-stone-200 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/[0.04]"
              >
                {canSubmit && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-white/20"
                    animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                Conjure
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
