/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      colors: {
        factory: {
          bg: "#0B0F17",
          panel: "#131A26",
          card: "#182234",
          border: "#23334D",
          accent: "#2563EB",
          highlight: "#38BDF8",
          warning: "#F59E0B",
          danger: "#EF4444",
          success: "#10B981",
          muted: "#64748B",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
