import type { Config } from "tailwindcss";

const config: Config = {
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { side: "#111111", canvas: "#f5f5f5" },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,.06)",
        pop: "0 12px 40px rgba(0,0,0,.14)",
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};
export default config;
