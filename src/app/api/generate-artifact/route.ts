import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Service role — only used server-side, never exposed to client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // SDK v1 returns FileOutput objects — use .url() to get the CDN URL
    const fileOutput = Array.isArray(output) ? output[0] : output;
    const replicateUrl = (fileOutput as { url(): URL }).url().href;

    // Download and re-upload to Supabase Storage so the URL never expires
    const imgRes = await fetch(replicateUrl);
    if (!imgRes.ok) throw new Error(`Replicate fetch failed: ${imgRes.status}`);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("artifacts")
      .upload(`${id}.webp`, imgBuffer, {
        contentType: "image/webp",
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("artifacts")
      .getPublicUrl(`${id}.webp`);

    const { error: rpcError } = await supabase.rpc("update_moment_artifact", {
      p_id: id,
      p_artifact_url: publicUrl,
    });
    if (rpcError) throw rpcError;

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[phosphene] artifact error", err);
    return NextResponse.json({ error: "generation failed" }, { status: 500 });
  }
}
