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
};

export async function fetchMoments(limit = 400): Promise<UserSpark[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(rowToSpark);
}

export async function fetchMyMoments(userId: string): Promise<UserSpark[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToSpark);
}

export async function saveMoment(spark: UserSpark, userId: string | null): Promise<void> {
  const supabase = createClient();
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
    user_id: userId,
  });
  if (error) throw error;
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
  };
}
