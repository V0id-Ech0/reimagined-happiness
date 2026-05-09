import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Server-side Supabase client — anon key is fine because update_moment_embedding
// is declared SECURITY DEFINER and bypasses RLS.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const { id, words } = await req.json();
    if (!id || !words) {
      return NextResponse.json({ error: "missing id or words" }, { status: 400 });
    }

    const { data } = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: words,
    });

    const embedding = data[0].embedding;

    const { error } = await supabase.rpc("update_moment_embedding", {
      p_id: id,
      p_embedding: embedding,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[phosphene] embed error", err);
    return NextResponse.json({ error: "embedding failed" }, { status: 500 });
  }
}
