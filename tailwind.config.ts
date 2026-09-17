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
          accentDark: "var(--accent-dark)",
          accentLight: "var(--accent-light)",
          /* Pastel Pink theme tokens */
          blush: "#E879A0",       /* Main pastel pink */
          rose: "#F472B6",        /* Pink-400 glow */
          fuchsia: "#D946EF",     /* Fuchsia accent */
          petal: "#FBCFE8",       /* Pink-200 subtle */
          maroon: "#991B1B",      /* Maroon theme accent */
          /* Neutrals */
          titanium: "#8E8E93",
          silver: "#D1D1D6",
          spaceBlack: "#09090B",
          platinum: "#F5F5F7",
          success: "#10B981",
          warning: "#F59E0B",
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
