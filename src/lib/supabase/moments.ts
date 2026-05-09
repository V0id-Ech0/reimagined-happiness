import { createClient } from "./client";
import type { GlowColor, UserSpark } from "@/lib/store";

type MomentRow = {
  id: string;
  words: string;
  color: string;
  hue: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  drift_speed: number;
  phase: number;
  created_at: string;
  artifact_url: string | null;
  handle: string | null;
};

export async function fetchMoments(limit = 400): Promise<UserSpark[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[phosphene] fetchMoments error", error);
    return [];
  }
  if (!data) return [];
  return data.map(rowToSpark);
}

export async function fetchMyMoments(userId: string): Promise<UserSpark[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[phosphene] fetchMyMoments error", error);
    return [];
  }
  if (!data) return [];
  return data.map(rowToSpark);
}

export async function saveMoment(spark: UserSpark, userId: string | null): Promise<void> {
  const supabase = createClient();

  // Pull user_id from the live auth session if the store hasn't resolved it yet
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id ?? null;
  }

  // Core insert — only columns that are guaranteed to exist
  const { error } = await supabase.from("moments").insert({
    id: spark.id,
    words: spark.words,
    color: spark.color,
    hue: spark.hue,
    x: spark.x,
    y: spark.y,
    z: spark.z,
    radius: spark.radius,
    drift_speed: spark.driftSpeed,
    phase: spark.phase,
    user_id: uid,
  });

  if (error) {
    console.error("[phosphene] saveMoment error", error);
    throw error;
  }

  // Best-effort: update handle if column exists (migration 0005)
  if (spark.handle) {
    await supabase
      .from("moments")
      .update({ handle: spark.handle })
      .eq("id", spark.id)
      .then(({ error: e }) => {
        if (e) console.warn("[phosphene] handle update skipped:", e.message);
      });
  }
}

function rowToSpark(row: MomentRow): UserSpark {
  return {
    id: row.id,
    words: row.words,
    color: row.color as GlowColor,
    hue: row.hue,
    x: row.x,
    y: row.y,
    z: row.z,
    radius: row.radius,
    driftSpeed: row.drift_speed,
    phase: row.phase,
    createdAt: new Date(row.created_at).getTime(),
    artifactUrl: row.artifact_url ?? undefined,
    handle: row.handle ?? undefined,
  };
}
