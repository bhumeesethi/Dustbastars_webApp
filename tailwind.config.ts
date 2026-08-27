import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0b0f19",
          card: "#151d30",
          border: "#2a3654",
          orange: "#f97316",
          coral: "#ff5e7e",
          teal: "#06b6d4",
          cyan: "#22d3ee",
          gold: "#fbbf24",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "brand-gradient": "linear-gradient(135deg, #ff5e7e 0%, #f97316 50%, #06b6d4 100%)",
        "brand-card": "linear-gradient(180deg, rgba(21, 29, 48, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
