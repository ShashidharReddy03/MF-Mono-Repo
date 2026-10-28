import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import {
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_700Bold,
} from "@expo-google-fonts/noto-sans-arabic";
import { getLanguage } from "@mf-bank/shared";

/** Loaded once in App.tsx */
export const FONT_ASSETS = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  // Montserrat has no Arabic letters → Noto Sans Arabic when the app is in Arabic
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_700Bold,
  // icon font used internally by @ant-design/react-native (Checkbox, Modal…)
  antoutline: require("@ant-design/icons-react-native/fonts/antoutline.ttf"),
};

const LATIN = {
  regular: "Montserrat_400Regular",
  medium: "Montserrat_500Medium",
  semibold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
} as const;

const ARABIC = {
  regular: "NotoSansArabic_400Regular",
  medium: "NotoSansArabic_500Medium",
  semibold: "NotoSansArabic_600SemiBold",
  bold: "NotoSansArabic_700Bold",
} as const;

export type FontWeight = keyof typeof LATIN;

/** Font family for the current language (the app restarts when language changes) */
export const fontFor = (weight: FontWeight) => (getLanguage() === "ar" ? ARABIC : LATIN)[weight];

/** Back-compat object: FONTS.semibold etc. resolve for the current language */
export const FONTS = {
  get regular() { return fontFor("regular"); },
  get medium() { return fontFor("medium"); },
  get semibold() { return fontFor("semibold"); },
  get bold() { return fontFor("bold"); },
};
