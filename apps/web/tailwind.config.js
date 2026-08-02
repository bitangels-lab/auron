/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        auron: {
          ink: "#0c1210",
          panel: "#141c18",
          line: "#24302a",
          mist: "#8fa398",
          foam: "#e8f0eb",
          accent: "#3d9b6e",
          warn: "#c4a35a",
          danger: "#c45c4a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
      },
      animation: {
        rise: "rise 0.45s ease-out both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("./plugins/auron-components.min.js"),
    require("./plugins/auron-forms.min.js"),
    require("./plugins/auron-layout.min.js"),
    require("./plugins/auron-reset.min.js"),
    require("./plugins/auron-scheme.min.js"),
    // require("./plugins/auron-tokens.min.js"),
    require("./plugins/auron-utilities.min.js"),
  ],
};
