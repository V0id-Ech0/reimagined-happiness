import { create } from "zustand";
import { fetchMoments, saveMoment } from "@/lib/supabase/moments";

export type GlowColor = "warm" | "cool" | "rose" | "sage" | "violet";

export const GLOW_HUES: Record<GlowColor, number> = {
  warm: 30,
  cool: 210,
  rose: 340,
  sage: 155,
  violet: 270,
};

export type UserSpark = {
  id: string;
  words: string;
  color: GlowColor;
  hue: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  driftSpeed: number;
  phase: number;
  createdAt: number;
};

type PendingConjure = {
  words: string;
  color: GlowColor;
};

type Store = {
  isConjureOpen: boolean;
  openConjure: () => void;
  closeConjure: () => void;

  // Sparks loaded from Supabase (the shared cosmos)
  dbSparks: UserSpark[];
  loadMoments: () => Promise<void>;

  // Sparks conjured in this session (get the bright glow phase)
  userSparks: UserSpark[];
  pendingConjure: PendingConjure | null;
  requestConjure: (words: string, color: GlowColor) => void;
  commitSpark: (spark: UserSpark) => void;
};

export const useStore = create<Store>((set) => ({
  isConjureOpen: false,
  openConjure: () => set({ isConjureOpen: true }),
  closeConjure: () => set({ isConjureOpen: false }),

  dbSparks: [],
  loadMoments: async () => {
    const sparks = await fetchMoments();
    set({ dbSparks: sparks });
  },

  userSparks: [],
  pendingConjure: null,
  requestConjure: (words, color) =>
    set({ pendingConjure: { words, color }, isConjureOpen: false }),
  commitSpark: (spark) => {
    set((state) => ({
      userSparks: [...state.userSparks, spark],
      pendingConjure: null,
    }));
    // Fire-and-forget — local state is the source of truth this session
    saveMoment(spark).catch(console.error);
  },
}));
