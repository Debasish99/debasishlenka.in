import type { Config } from "tailwindcss";

// Colors and fonts below read from CSS variables defined in app/globals.css.
// Swap the values in globals.css once Phase 1 (Design Direction) is final —
// no changes needed here or in components.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: {
          DEFAULT: "var(--color-muted)",
          bg: "var(--color-muted-bg)",
          faint: "var(--color-muted-faint)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dim: "var(--color-accent-dim)",
        },
        border: "var(--color-border)",
        // Aliases matching the Home Page components' naming
        bg: {
          DEFAULT: "var(--color-background)",
          raised: "var(--color-background-raised)",
          "raised-2": "var(--color-background-raised-2)",
        },
        text: {
          DEFAULT: "var(--color-foreground)",
          muted: "var(--color-muted)",
          faint: "var(--color-muted-faint)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        container: "var(--container-max)",
      },
      spacing: {
        gutter: "var(--gutter)",
        18: "72px",
      },
      keyframes: {
        blink: {
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
