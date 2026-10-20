import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0D1117",
        surface: {
          elevated: "#161B22",
          primary: "#1C2430",
          card: "#18202C",
          hover: "#222D3D",
          active: "#2A374A",
        },
        solana: {
          green: "#14F195",
          "green-hover": "#10c97b",
          "green-light": "rgba(20, 241, 149, 0.12)",
          purple: "#9945FF",
          "purple-hover": "#7d36d4",
          "purple-light": "rgba(153, 69, 255, 0.12)",
          yellow: "#FFE600",
          "yellow-hover": "#e6cf00",
          "yellow-light": "rgba(255, 230, 0, 0.12)",
        },
        planet: {
          text: "#F5F7FA",
          muted: "#A5AFBC",
          subtle: "#6E7681",
          border: "#252F3F",
          "border-subtle": "#1E2633",
          "border-focus": "#14F195",
          danger: "#FF4D4D",
          "danger-light": "rgba(255, 77, 77, 0.12)",
          warning: "#F59E0B",
          success: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(20, 241, 149, 0.25)",
        "glow-purple": "0 0 25px -5px rgba(153, 69, 255, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
