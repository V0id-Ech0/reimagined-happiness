import dynamic from "next/dynamic";
import { Wordmark } from "@/components/ui/Wordmark";
import { NavPanel } from "@/components/ui/NavPanel";
import { ConjureButton } from "@/components/ui/ConjureButton";

// Canvas is client-only — Three.js won't run during SSR
const Cosmos = dynamic(
  () => import("@/components/canvas/Cosmos").then((m) => m.Cosmos),
  { ssr: false },
);

export default function Home() {
  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-void-950">
      {/* Ambient starfield behind the WebGL canvas — visible while GL warms up */}
      <div className="ambient-field absolute inset-0" />

      {/* The living cosmos */}
      <div className="absolute inset-0 animate-fade-in">
        <Cosmos />
      </div>

      {/* Vignette to soften the edges */}
      <div className="canvas-vignette pointer-events-none absolute inset-0" />

      {/* Persistent UI shell */}
      <Wordmark />
      <NavPanel />
      <ConjureButton />
    </main>
  );
}
