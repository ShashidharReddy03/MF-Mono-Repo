/**
 * Language support shared by web and mobile.
 *
 * Keys are the English text itself (gettext style):
 *   t("Sign in")                       → "Sign in" | "تسجيل الدخول"
 *   t("Delete {{name}}", { name })     → interpolation
 * English needs no file — a missing Arabic entry falls back to English,
 * never to a blank or a raw key. `npm run i18n:check` lists missing ones.
 */
import i18next from "i18next";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import ar from "./locales/ar.json";
import { setLangCode } from "../config/platform";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", dir: "ltr", serverCode: "en_US" },
  // serverCode: confirm the exact value the backend expects for Arabic
  { code: "ar", label: "العربية", dir: "rtl", serverCode: "ar_AE" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export type TextDirection = "ltr" | "rtl";

const i18n = i18next.createInstance();
const EN: Record<string, string> = Object.fromEntries(Object.keys(ar).map((k) => [k, k]));

export const isSupportedLanguage = (code?: string | null): code is LanguageCode =>
  SUPPORTED_LANGUAGES.some((l) => l.code === code);

/** Pick a supported language from a device/browser tag like "ar-AE" or "en-GB" */
export const resolveLanguage = (tag?: string | null): LanguageCode => {
  const base = (tag ?? "").toLowerCase().split(/[-_]/)[0];
  return isSupportedLanguage(base) ? base : "en";
};

const languageInfo = (code: string) => SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];

/** dayjs Arabic month/day names, but keep Western digits (amounts, dates and API values stay consistent) */
const applyDayjsLocale = (code: LanguageCode) => {
  dayjs.locale(code === "ar" ? "ar" : "en");
  if (code === "ar") {
    const loc = dayjs.Ls.ar as { postformat?: unknown; preparse?: unknown } | undefined;
    if (loc) {
      loc.postformat = (s: string) => s;
      loc.preparse = (s: string) => s;
    }
  }
};

const listeners = new Set<() => void>();

/** Call once at startup (bootstrap.ts), before rendering */
export const initI18n = (language: LanguageCode = "en") => {
  void i18n.init({
    lng: language,
    fallbackLng: "en",
    // English = the keys themselves. Listing them explicitly guarantees {{placeholders}} are filled in.
    resources: { en: { translation: EN }, ar: { translation: ar } },
    keySeparator: false, // keys are sentences — "." and ":" are ordinary characters
    nsSeparator: false,
    interpolation: { escapeValue: false }, // React escapes already
    returnEmptyString: false,
    initAsync: false, // resources are bundled → synchronous init
  });
  applyDayjsLocale(language);
  setLangCode(languageInfo(language).serverCode);
};

/** Translate. Safe to call anywhere (components, hooks, validators, toasts). */
export const t = (key: string, options?: Record<string, unknown>): string => i18n.t(key, options) as string;

export const getLanguage = (): LanguageCode => (isSupportedLanguage(i18n.language) ? i18n.language : "en");
export const getDirection = (code: string = getLanguage()): TextDirection => languageInfo(code).dir;
export const isRTL = () => getDirection() === "rtl";

/**
 * Switch language: UI text, dayjs, and the `langcode` sent with every API
 * request (so server messages come back in the same language).
 */
export const changeLanguage = async (code: LanguageCode) => {
  await i18n.changeLanguage(code);
  applyDayjsLocale(code);
  setLangCode(languageInfo(code).serverCode);
  listeners.forEach((l) => l());
};

export const subscribeLanguage = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** For validator messages: "Please enter username" in English, label as-is in Arabic */
export const fieldLabel = (label: string) => {
  const translated = t(label);
  return getLanguage() === "en" && label !== "OTP" && label !== "CIF" ? translated.toLowerCase() : translated;
};
