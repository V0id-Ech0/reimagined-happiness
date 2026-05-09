import { create } from "zustand";
import { fetchMoments, fetchMyMoments, saveMoment } from "@/lib/supabase/moments";
import { fetchSimilarPairs, requestEmbedding, requestArtifact, type SimilarPair } from "@/lib/supabase/similarity";

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
  artifactUrl?: string;
};

type PendingConjure = {
  words: string;
  color: GlowColor;
};

export type ViewMode = "cosmos" | "constellation";

type Store = {
  isConjureOpen: boolean;
  openConjure: () => void;
  closeConjure: () => void;

  // Auth — anonymous session, persisted across refreshes
  userId: string | null;
  setUserId: (id: string | null) => void;

  // All sparks in the shared cosmos
  dbSparks: UserSpark[];
  loadMoments: () => Promise<void>;

  // Only this user's persistent sparks (loaded from Supabase by user_id)
  myDbSparks: UserSpark[];
  loadMyMoments: (userId: string) => Promise<void>;

  // Sparks conjured in this session (bright glow phase)
  userSparks: UserSpark[];
  pendingConjure: PendingConjure | null;
  requestConjure: (words: string, color: GlowColor) => void;
  commitSpark: (spark: UserSpark) => void;

  // AI similarity threads
  similarPairs: SimilarPair[];
  loadSimilarPairs: () => Promise<void>;

  // Hover card
  hoveredMoment: { id: string; words: string; color: GlowColor; artifactUrl?: string; x: number; y: number } | null;
  setHoveredMoment: (m: Store["hoveredMoment"]) => void;

  // Two-view zoom system
  viewMode: ViewMode;
  viewVersion: number;
  setViewMode: (mode: ViewMode) => void;
  isTransitioning: boolean;
  _setTransitioning: (v: boolean) => void;
};

export const useStore = create<Store>((set, get) => ({
  isConjureOpen: false,
  openConjure: () => set({ isConjureOpen: true }),
  closeConjure: () => set({ isConjureOpen: false }),

  userId: null,
  setUserId: (id) => set({ userId: id }),

  dbSparks: [],
  loadMoments: async () => {
    const sparks = await fetchMoments();
    set({ dbSparks: sparks });
  },

  myDbSparks: [],
  loadMyMoments: async (userId) => {
    const sparks = await fetchMyMoments(userId);
    set({ myDbSparks: sparks });
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
    const { userId } = get();
    saveMoment(spark, userId)
      .then(() => Promise.all([
        requestEmbedding(spark.id, spark.words),
        requestArtifact(spark.id, spark.words),
      ]))
      .catch(console.error);
  },

  similarPairs: [],
  loadSimilarPairs: async () => {
    const pairs = await fetchSimilarPairs();
    set({ similarPairs: pairs });
  },

  hoveredMoment: null,
  setHoveredMoment: (m) => set({ hoveredMoment: m }),

  viewMode: "cosmos",
  viewVersion: 0,
  setViewMode: (mode) =>
    set((s) => ({ viewMode: mode, viewVersion: s.viewVersion + 1 })),
  isTransitioning: false,
  _setTransitioning: (v) => set({ isTransitioning: v }),
}));
