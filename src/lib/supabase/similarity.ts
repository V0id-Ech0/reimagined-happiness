import { createClient } from "./client";

export type SimilarPair = {
  idA: string;
  idB: string;
  similarity: number;
};

export async function fetchSimilarPairs(
  threshold = 0.70,
  limit = 150,
): Promise<SimilarPair[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_similar_pairs", {
    p_threshold: threshold,
    p_limit: limit,
  });

  if (error || !data) return [];

  return (data as { id_a: string; id_b: string; similarity: number }[]).map(
    (row) => ({ idA: row.id_a, idB: row.id_b, similarity: row.similarity }),
  );
}

/** Called fire-and-forget after saving a moment. */
export async function requestEmbedding(id: string, words: string): Promise<void> {
  await fetch("/api/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, words }),
  });
}

/** Called fire-and-forget after saving a moment — generates the Replicate artifact. Returns the URL on success. */
export async function requestArtifact(id: string, words: string): Promise<string | null> {
  try {
    const res = await fetch("/api/generate-artifact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, words }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.url as string) ?? null;
  } catch {
    return null;
  }
}
