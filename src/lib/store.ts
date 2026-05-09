import { create } from "zustand";
import { fetchMoments, fetchMyMoments, saveMoment } from "@/lib/supabase/moments";
import { fetchSimilarPairs, requestEmbedding, requestArtifact, type SimilarPair } from "@/lib/supabase/similarity";
import { getOrCreateHandle } from "@/lib/handle";

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
  handle?: string;
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

  // Poetic location handle, e.g. "a wandering spark from Kyoto"
  localHandle: string | null;
  initHandle: () => Promise<void>;

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
  hoveredMoment: { id: string; words: string; color: GlowColor; artifactUrl?: string; handle?: string; x: number; y: number } | null;
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

  localHandle: null,
  initHandle: async () => {
    const h = await getOrCreateHandle();
    set({ localHandle: h });
  },

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
    const { userId, localHandle } = get();
    const stamped = { ...spark, handle: localHandle ?? undefined };
    set((state) => ({
      userSparks: [...state.userSparks, stamped],
      pendingConjure: null,
    }));
    saveMoment(stamped, userId)
      .then(async () => {
        const [, artifactUrl] = await Promise.all([
          requestEmbedding(stamped.id, stamped.words),
          requestArtifact(stamped.id, stamped.words),
        ]);
        // Reload similarity pairs now that a new embedding exists
        const pairs = await fetchSimilarPairs(0.60);
        set((s) => ({
          similarPairs: pairs,
          ...(artifactUrl
            ? {
                userSparks: s.userSparks.map((us) =>
                  us.id === stamped.id ? { ...us, artifactUrl } : us
                ),
              }
            : {}),
        }));
      })
      .catch(console.error);
  },

  similarPairs: [],
  loadSimilarPairs: async () => {
    const pairs = await fetchSimilarPairs(0.60);
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
