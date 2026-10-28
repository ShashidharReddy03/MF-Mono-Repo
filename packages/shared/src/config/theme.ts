/**
 * Colour themes — shared by web (antd + Tailwind) and mobile (antd-rn + NativeWind).
 *
 * "classic" is the original MF Bank navy + green (colors.json) and stays the default.
 * Tailwind classes (bg-primary, text-secondary-dark …) read CSS variables, so a theme
 * switch recolours every screen without touching its code. JS code that needs a
 * colour value (antd theme, icons) reads `colors.x`, which always returns the
 * active theme's value.
 */
import classic from "./colors.json";
import { t } from "../i18n";

export type ThemePalette = typeof classic;
export type ColorToken = keyof ThemePalette;

export const THEMES = {
  classic: { get label() { return t("Classic"); }, palette: classic },
  ocean: {
    get label() { return t("Ocean"); },
    palette: {
      primary: "#0B3C5D",
      primaryLight: "#1F5F8B",
      primaryDark: "#062A42",
      secondary: "#0E9F9A",
      secondaryLight: "#E1F5F4",
      secondaryDark: "#0A7A76",
      surface: "#F2F7F9",
      muted: "#5F6B73",
      danger: "#DC2626",
      warning: "#F59E0B",
    },
  },
  desert: {
    get label() { return t("Desert"); },
    palette: {
      primary: "#5C1A2B",
      primaryLight: "#84324A",
      primaryDark: "#3D0F1C",
      secondary: "#B8860B",
      secondaryLight: "#FBF3DF",
      secondaryDark: "#8A6508",
      surface: "#FAF6F2",
      muted: "#6B6461",
      danger: "#C62828",
      warning: "#E08A00",
    },
  },
  royal: {
    get label() { return t("Royal"); },
    palette: {
      primary: "#2E1A5C",
      primaryLight: "#4B3487",
      primaryDark: "#1D0F3D",
      secondary: "#6D4FD8",
      secondaryLight: "#EFEBFC",
      secondaryDark: "#5137B0",
      surface: "#F6F5FB",
      muted: "#66647A",
      danger: "#DC2626",
      warning: "#F59E0B",
    },
  },
} as const satisfies Record<string, { readonly label: string; palette: ThemePalette }>;

export type ThemeId = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeId = "classic";
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const isThemeId = (v: unknown): v is ThemeId => typeof v === "string" && v in THEMES;

let current: ThemeId = DEFAULT_THEME;
const listeners = new Set<() => void>();

export const getTheme = (): ThemeId => current;
export const getPalette = (id: ThemeId = current): ThemePalette => THEMES[id].palette;

/** Apply a theme everywhere (callers persist the choice and update CSS variables) */
export const setTheme = (id: ThemeId) => {
  if (!isThemeId(id) || id === current) return;
  current = id;
  listeners.forEach((l) => l());
};

export const subscribeTheme = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Live colour values for the active theme: colors.primary, colors.secondaryDark … */
export const colors = Object.defineProperties(
  {} as ThemePalette,
  Object.fromEntries(
    (Object.keys(classic) as ColorToken[]).map((k) => [k, { enumerable: true, get: () => THEMES[current].palette[k] }]),
  ),
);

/** CSS variable name used by the Tailwind preset: primaryLight → --c-primary-light */
export const cssVarName = (token: ColorToken) => `--c-${token.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

const hexToRgbTriplet = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** { "--c-primary": "0 43 99", … } — space-separated so Tailwind opacity (bg-primary/10) works */
export const themeCssVars = (id: ThemeId = current): Record<string, string> =>
  Object.fromEntries(
    Object.entries(THEMES[id].palette).map(([k, hex]) => [cssVarName(k as ColorToken), hexToRgbTriplet(hex)]),
  );
