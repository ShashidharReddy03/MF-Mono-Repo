import { DevSettings, I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNLocalize from "react-native-localize";
import RNRestart from "react-native-restart";
import { getDirection, initI18n, isSupportedLanguage, resolveLanguage, changeLanguage, type LanguageCode } from "@mf-bank/shared";

const STORAGE_KEY = "mfb.lang";

const deviceLanguage = (): LanguageCode => resolveLanguage(RNLocalize.getLocales()[0]?.languageCode);

export const initMobileLanguageSync = () => initI18n(deviceLanguage());

const restartApp = async () => {
  try {
    RNRestart.Restart();
  } catch {
    if (__DEV__) DevSettings.reload();
  }
};

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
    return false;
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
