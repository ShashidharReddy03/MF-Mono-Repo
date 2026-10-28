/**
 * Mobile side of colour themes. Unlike language, a theme needs no restart:
 * NativeWind classes read CSS variables supplied by vars() on the root view,
 * and the app tree is re-rendered (navigation state kept) for JS colours.
 */
import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTheme, isThemeId, setTheme, subscribeTheme, type ThemeId } from "@mf-bank/shared";

const STORAGE_KEY = "mfb.theme"; // UI preference only — no session or customer data

/** Before the first render (App.tsx): apply the saved theme, default Classic */
export const loadSavedTheme = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (isThemeId(saved)) setTheme(saved);
  } catch {
    /* storage unavailable → Classic */
  }
};

export const setMobileTheme = async (id: ThemeId) => {
  setTheme(id);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* applied, just not remembered */
  }
};

export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme);
