import { getLanguage } from "@mf-bank/shared";

/**
 * Linked via assets/fonts (see scripts/copy-fonts.js). Names match the TTF
 * PostScript / Android file names — not Expo's `useFonts` keys.
 */
const LATIN = {
  regular: "Montserrat-Regular",
  medium: "Montserrat-Medium",
  semibold: "Montserrat-SemiBold",
  bold: "Montserrat-Bold",
} as const;

const ARABIC = {
  regular: "NotoSansArabic-Regular",
  medium: "NotoSansArabic-Medium",
  semibold: "NotoSansArabic-SemiBold",
  bold: "NotoSansArabic-Bold",
} as const;

export type FontWeight = keyof typeof LATIN;

export const fontFor = (weight: FontWeight) => (getLanguage() === "ar" ? ARABIC : LATIN)[weight];

export const FONTS = {
  get regular() {
    return fontFor("regular");
  },
  get medium() {
    return fontFor("medium");
  },
  get semibold() {
    return fontFor("semibold");
  },
  get bold() {
    return fontFor("bold");
  },
};
