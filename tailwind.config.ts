import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          surfaceSecondary: "var(--surface-secondary)",
          border: "var(--border)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          accent: "var(--accent)",
          accentCyan: "var(--accent-cyan)",
          titanium: "#8E8E93",
          silver: "#D1D1D6",
          spaceBlack: "#09090B",
          platinum: "#F5F5F7",
          success: "#34C759",
          warning: "#FF9F0A",
          danger: "#FF3B30",
        },
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
        sheet: "20px",
      },
      boxShadow: {
        ios: "0 1px 2px rgba(0, 0, 0, 0.04)",
        iosHover: "0 4px 12px rgba(0, 0, 0, 0.06)",
        iosSheet: "0 -4px 24px rgba(0, 0, 0, 0.12)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
