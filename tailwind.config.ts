import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: "#191A1D",
          panel: "#212327",
          line: "#33353A",
          ember: "#C1603D",
          brass: "#C9A24B",
          paper: "#EDEAE2",
          mute: "#8B8D93",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
