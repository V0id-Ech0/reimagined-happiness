const KEY = "phosphene-handle";

export async function getOrCreateHandle(): Promise<string> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(KEY);
    if (cached) return cached;
  }

  try {
    const res = await fetch("/api/locate");
    const { handle } = await res.json();
    const h: string = handle ?? "a light in the cosmos";
    if (typeof window !== "undefined") localStorage.setItem(KEY, h);
    return h;
  } catch {
    return "a light in the cosmos";
  }
}
