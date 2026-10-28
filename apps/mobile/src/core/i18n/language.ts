/**
 * Mobile side of language support.
 *
 * React Native only mirrors layouts (RTL) after a restart, so changing
 * language = save choice → set RTL flag → restart the JS app. The switch is
 * offered on pre-login screens only, so no session is ever lost by it.
 */
import { DevSettings, I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { reloadAppAsync } from "expo";
import { getDirection, initI18n, isSupportedLanguage, resolveLanguage, changeLanguage, type LanguageCode } from "@mf-bank/shared";

const STORAGE_KEY = "mfb.lang"; // UI preference only — no session or customer data

const deviceLanguage = (): LanguageCode => resolveLanguage(Localization.getLocales()[0]?.languageCode);

/** Synchronous start (bootstrap.ts): device language, so t() works immediately */
export const initMobileLanguageSync = () => initI18n(deviceLanguage());

/** expo's reloadAppAsync works in dev and release builds (expo-updates' reloadAsync doesn't without EAS Update) */
const restartApp = async () => {
  try {
    await reloadAppAsync("Language changed");
  } catch {
    if (__DEV__) DevSettings.reload();
  }
};

/** Make the native layout direction match the language. Returns true if a restart is needed. */
const syncDirection = (code: LanguageCode) => {
  const rtl = getDirection(code) === "rtl";
  I18nManager.allowRTL(rtl);
  I18nManager.swapLeftAndRightInRTL(true);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
};

/**
 * Called once before the first render (App.tsx): apply the saved choice.
 * If the saved language needs the other layout direction, restart once.
 */
export const loadSavedLanguage = async (): Promise<boolean> => {
  let saved: string | null = null;
  try {
    saved = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage unavailable → device language */
  }
  const lang: LanguageCode = isSupportedLanguage(saved) ? saved : deviceLanguage();
  await changeLanguage(lang);
  if (syncDirection(lang)) {
    await restartApp();
    return false; // app is restarting — don't render this run
  }
  return true;
};

export const setMobileLanguage = async (code: LanguageCode) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* not remembered, still applied */
  }
  await changeLanguage(code);
  syncDirection(code);
  await restartApp();
};
