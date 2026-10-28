/** Same brand tokens as the Expo and web apps, via the shared preset. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.ts", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset"), require("@mf-bank/shared/tailwind.preset.js")],
  theme: { extend: {} },
  plugins: [],
};
