import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          ink: "#111827",
          muted: "#64748b",
          paper: "#f8fafc",
          line: "#e2e8f0"
        }
      }
    }
  },
  plugins: []
};

export default config;
