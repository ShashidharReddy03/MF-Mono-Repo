/**
 * Web side of language support: remembers the choice, sets <html lang/dir>,
 * and exposes a hook that re-renders the app when the language changes.
 */
import { useSyncExternalStore } from "react";
import {
  changeLanguage,
  getDirection,
  getLanguage,
  initI18n,
  isSupportedLanguage,
  resolveLanguage,
  subscribeLanguage,
  type LanguageCode,
} from "@mf-bank/shared";

const STORAGE_KEY = "mfb.lang"; // UI preference only — no session or customer data

const readSaved = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const applyToDocument = (code: LanguageCode) => {
  document.documentElement.lang = code;
  document.documentElement.dir = getDirection(code);
};

/** Saved choice → browser language → English */
export const initWebLanguage = () => {
  const saved = readSaved();
  const lang = isSupportedLanguage(saved) ? saved : resolveLanguage(navigator.language);
  initI18n(lang);
  applyToDocument(lang);
};

export const setWebLanguage = async (code: LanguageCode) => {
  await changeLanguage(code);
  applyToDocument(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode — choice just isn't remembered */
  }
};

/** Current language; components using it re-render on change */
export const useLanguage = () => useSyncExternalStore(subscribeLanguage, getLanguage);
