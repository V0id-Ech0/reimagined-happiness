import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

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

    const prompt =
      `abstract luminous particle art, glowing ethereal light, dark cosmic void background, ` +
      `"${words}", bokeh light streaks, no text, minimalist, macro photography`;

    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 75,
        num_inference_steps: 4,
      },
    });

    // SDK v1 returns FileOutput objects — coerce to URL string
    const url = String(Array.isArray(output) ? output[0] : output);

    const { error } = await supabase.rpc("update_moment_artifact", {
      p_id: id,
      p_artifact_url: url,
    });

    if (error) throw error;

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[phosphene] artifact error", err);
    return NextResponse.json({ error: "generation failed" }, { status: 500 });
  }
}
