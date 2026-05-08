import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phosphene — every moment of happiness leaves a light",
  description:
    "A living visual cosmos where moments of joy become glowing connected nodes. Map your inner light.",
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-void-950 text-stone-200 antialiased">{children}</body>
    </html>
  );
}
