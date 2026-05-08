# Phosphene

> *Every moment of happiness leaves a light.*

Phosphene is a living, visual web experience where every moment of joy you capture becomes a glowing node on an infinite dark canvas — shaped by your words, your color, your hand, and a unique particle animation conjured just for that memory. Over time, your nodes connect into a personal constellation. Zoom out far enough and your constellation bleeds into a collective cosmos: a shared, ever-growing map of joy from people around the world, each one a quiet wandering spark.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: In Development](https://img.shields.io/badge/status-in%20development-blueviolet)]()

---

## What It Is

A phosphene is the light you see when there's no light — the colors that bloom behind closed eyes, conjured entirely from within. That's the premise: your inner happiness, made visible.

Phosphene is not a journal. Not a social network. Not a mood tracker. It's a new kind of thing — a visual cosmos that grows with you, connects you to others without exposing you, and makes the invisible architecture of your joy into something you can actually see.

---

## Core Experience

### Your Constellation (Private)
- Log a moment of happiness with words, a color, a shape, a quick drawing, or let the app conjure a unique animated particle artifact for it
- Each entry becomes a node — starting from a base form, evolving over time through connections, interactions, and the passage of time
- Nodes never disappear, but their glow fades unless revisited or touched by others
- Three layers of connection form automatically: AI-detected emotional similarity (faint threads), color/mood resonance (ambient clustering), and your own hand-drawn links (brightest)
- Your full history is always there — zoom in close to relive a single memory, or pull back to see the shape of your happiness across months and years

### The Collective Cosmos (Shared)
- Zoom out past your private constellation and your stars drift into a vast shared canvas
- Every contributor appears as an anonymous wandering spark with a light location handle — *"a drifting ember from Lagos"*, *"a quiet light from Reykjavik"*
- Hover a stranger's node to read it, react with an emoji, or leave a brief response
- Contributions persist forever and keep building — the collective is always growing
- You can release a private star into the collective, or keep it entirely to yourself

### Navigation
- A persistent ambient panel anchors you — always know whether you're in *your world* or *the world*, and move between them fluidly
- The transition is continuous zoom, not a hard switch — your stars don't disappear, they just become part of something larger

---

## Design Principles

- **Wonder first.** Every interaction should produce a moment of quiet surprise.
- **Nothing is lost.** Joy persists. Glow fades. The star stays.
- **No noise.** The UI exists to disappear. The canvas is everything.
- **Earn complexity.** Start simple. Let depth reveal itself over time.
- **Private is the default.** Sharing is always a deliberate, reversible choice.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Canvas / 3D | React Three Fiber + Three.js |
| Graph Physics | D3.js force simulation |
| Particles | Custom GLSL shaders |
| UI Animations | Framer Motion |
| Styling | Tailwind CSS |
| State | Zustand |
| Auth + DB + Realtime | Supabase |
| AI Similarity | OpenAI Embeddings |
| Generative Visuals | Replicate / fal.ai |

---

## Project Status

Phosphene is in active early development. The concept is fully designed; implementation begins now.

See [VISION.md](VISION.md) for the complete creative and design brief.

---

## Getting Started

```bash
git clone https://github.com/v0id-ech0/reimagined-happiness.git
cd reimagined-happiness
cp .env.example .env
npm install
npm run dev
```

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## License

[MIT](LICENSE) — © 2026 v0id-ech0
