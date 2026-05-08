/**
 * Seed sparks for the very first second a visitor lands on Phosphene.
 * These will be replaced by real Supabase data once persistence is wired in.
 * Each spark has a deterministic position so the cosmos feels stable on reload.
 */

export type SeedSpark = {
  id: string;
  x: number;
  y: number;
  z: number;
  hue: number;
  radius: number;
  driftSpeed: number;
  phase: number;
  intensity: number;
  handle: string;
};

const HANDLES = [
  "a wandering spark from Osaka",
  "a quiet ember from Reykjavík",
  "a drifting light from São Paulo",
  "a soft glow from Lagos",
  "a small flame from Lisbon",
  "a slow pulse from Hanoi",
  "a faint shimmer from Kraków",
  "a low hum from Cairo",
  "a still point from Auckland",
  "a warm trace from Mexico City",
  "a calm gleam from Seoul",
  "a dim halo from Helsinki",
  "a low light from Marrakesh",
  "a steady mote from Buenos Aires",
];

// Pseudo-random but deterministic — hash-based positioning
function hash(seed: number, salt: number) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function generateSeedSparks(count = 64): SeedSpark[] {
  const sparks: SeedSpark[] = [];
  for (let i = 0; i < count; i++) {
    const angle = hash(i, 1) * Math.PI * 2;
    const distance = 4 + hash(i, 2) * 18;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance * 0.7;
    const z = (hash(i, 3) - 0.5) * 6;
    sparks.push({
      id: `seed-${i}`,
      x,
      y,
      z,
      hue: 20 + hash(i, 4) * 320,
      radius: 0.06 + hash(i, 5) * 0.14,
      driftSpeed: 0.2 + hash(i, 6) * 0.6,
      phase: hash(i, 7) * Math.PI * 2,
      intensity: 0.4 + hash(i, 8) * 0.6,
      handle: HANDLES[i % HANDLES.length],
    });
  }
  return sparks;
}
