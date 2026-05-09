import { type NextRequest, NextResponse } from "next/server";

const FALLBACK = "a light in the cosmos";

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? "");

  // Localhost / private range — no useful geo data
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return NextResponse.json({ handle: FALLBACK });
  }

  try {
    const res = await fetch(`https://ipwho.is/${ip}`, {
      headers: { "User-Agent": "phosphene/1.0" },
      next: { revalidate: 0 },
    });
    const data = await res.json();
    const city: string | undefined = data.city || data.region || data.country;
    if (!city) return NextResponse.json({ handle: FALLBACK });
    return NextResponse.json({ handle: `a wandering spark from ${city}` });
  } catch {
    return NextResponse.json({ handle: FALLBACK });
  }
}
