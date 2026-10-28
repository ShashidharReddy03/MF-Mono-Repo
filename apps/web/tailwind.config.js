import sharedPreset from "@mf-bank/shared/tailwind.preset.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedPreset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // antd ships its own reset; keep Tailwind preflight but avoid clobbering buttons
  corePlugins: { preflight: true },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "Noto Sans Arabic", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      screens: { xs: "450px", "3xl": "1700px" },
    },
  },
  plugins: [],
};
