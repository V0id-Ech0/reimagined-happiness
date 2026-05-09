import { NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// update_moment_artifact is security-definer so the anon key is enough
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
      `"${words}" — ethereal glowing interpretation, luminous light painting style, ` +
      `dark cosmic void background, soft bokeh, dreamlike and cinematic, no text, no words`;

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

    // SDK v1 returns FileOutput objects — .url() gives the CDN URL
    const fileOutput = Array.isArray(output) ? output[0] : output;
    const url: string =
      fileOutput !== null &&
      typeof fileOutput === "object" &&
      "url" in fileOutput
        ? (fileOutput as { url(): URL }).url().href
        : String(fileOutput);

    if (!url.startsWith("http")) throw new Error(`Unexpected URL: ${url}`);

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
