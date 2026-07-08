import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Warm orange drawn from the Al-Tomoh logo mark */
        brand: {
          50: "#fef6ee",
          100: "#fdead7",
          200: "#fad1ae",
          300: "#f7b07a",
          400: "#f28544",
          500: "#ee7124",
          600: "#df5715",
          700: "#b94213",
          800: "#933517",
          900: "#772e16",
          950: "#401509",
        },
        /* Deep navy drawn from the calligraphic pen of the logo */
        navy: {
          50: "#f2f5fb",
          100: "#e2e9f6",
          200: "#ccd8ef",
          300: "#a9bfe4",
          400: "#809ed6",
          500: "#6281ca",
          600: "#4e69bd",
          700: "#4458ac",
          800: "#3c4a8d",
          900: "#1e2a5e",
          950: "#141c40",
        },
        /* Soft warm surfaces for light mode */
        parchment: {
          50: "#fdfbf7",
          100: "#f9f4ec",
          200: "#f1e7d8",
        },
        /* Deep navy surfaces for dark mode */
        ink: {
          900: "#10162e",
          950: "#0b1024",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 28, 64, 0.06), 0 8px 24px -12px rgba(20, 28, 64, 0.12)",
        "card-hover":
          "0 2px 4px rgba(20, 28, 64, 0.08), 0 16px 40px -12px rgba(20, 28, 64, 0.2)",
        "card-dark": "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px -8px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        page: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        page: "page 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
