/**
 * Web side of colour themes: remembers the choice, writes the theme's CSS
 * variables on <html> (Tailwind classes follow instantly) and exposes a hook
 * so antd and other JS colour users re-render.
 */
import { useSyncExternalStore } from "react";
import { colors, getTheme, isThemeId, setTheme, subscribeTheme, themeCssVars, type ThemeId } from "@mf-bank/shared";

const STORAGE_KEY = "mfb.theme"; // UI preference only — no session or customer data

const applyToDocument = (id: ThemeId) => {
  const root = document.documentElement;
  Object.entries(themeCssVars(id)).forEach(([name, value]) => root.style.setProperty(name, value));
  // browser UI tint on mobile Chrome
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors.primary);
};

/** Saved choice → Classic. Call once in bootstrap, before the first render. */
export const initWebTheme = () => {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage blocked → default theme */
  }
  if (isThemeId(saved)) setTheme(saved);
  applyToDocument(getTheme());
};

export const setWebTheme = (id: ThemeId) => {
  setTheme(id);
  applyToDocument(id);
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode — applied, just not remembered */
  }
};

/** Current theme; components using it re-render on change */
export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme);
