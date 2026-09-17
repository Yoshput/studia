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
          surfaceTertiary: "var(--surface-tertiary)",
          border: "var(--border)",
          borderSubtle: "var(--border-subtle)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          accent: "var(--accent)",
          accentSecondary: "var(--accent-secondary)",
          accentDark: "var(--accent-dark)",
          accentLight: "var(--accent-light)",
          /* Official Telkom Colors */
          telkomMaroon: "#B6252A",
          telkomRed: "#ED1E28",
          /* Semantic Apple HIG */
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
      },
      borderRadius: {
        card: "18px",
        btn: "12px",
        input: "10px",
        sheet: "20px",
      },
      boxShadow: {
        ios: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 14px rgba(0, 0, 0, 0.03)",
        iosHover: "0 6px 20px rgba(0, 0, 0, 0.07)",
        iosSheet: "0 -4px 24px rgba(0, 0, 0, 0.12)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
