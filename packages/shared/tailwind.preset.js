/**
 * Shared Tailwind preset — used by BOTH apps/web (tailwindcss) and
 * apps/mobile (NativeWind). Colours are CSS variables so the active theme
 * (packages/shared/src/config/theme.ts) recolours every class at runtime.
 * Defaults (Classic theme) are declared in each app's global CSS.
 */
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: v("primary"), light: v("primary-light"), dark: v("primary-dark") },
        secondary: { DEFAULT: v("secondary"), light: v("secondary-light"), dark: v("secondary-dark") },
        surface: v("surface"),
        muted: v("muted"),
        danger: v("danger"),
        warning: v("warning"),
      },
      fontSize: {
        "2xs": "10px",
      },
    },
  },
};
