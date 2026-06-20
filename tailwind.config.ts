import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-subtle": "var(--ink-subtle)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-ink": "var(--accent-ink)",
        positive: "var(--positive)",
        "positive-soft": "var(--positive-soft)",
        negative: "var(--negative)",
        "negative-soft": "var(--negative-soft)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04)",
        float: "0 12px 40px rgba(16, 24, 40, 0.10)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
