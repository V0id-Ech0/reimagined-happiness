import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Phosphene palette — deep void, luminous accents
        void: {
          950: "#050507",
          900: "#0a0a0f",
          800: "#0f0f17",
          700: "#15151f",
        },
        glow: {
          warm: "#ffd9a8",
          cool: "#a8d9ff",
          rose: "#ff9ec7",
          sage: "#9ed4c0",
          violet: "#c5a8ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      animation: {
        "drift-slow": "drift 24s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        "fade-in": "fadeIn 1.2s ease-out",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(8px, -6px)" },
          "66%": { transform: "translate(-6px, 8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.85", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(0.5px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
