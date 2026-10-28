import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import arEG from "antd/locale/ar_EG";
import enUS from "antd/locale/en_US";
import { colors, getDirection, type LanguageCode, type ThemeId } from "@mf-bank/shared";

/**
 * antd: brand theme + language (built-in texts, date picker) + RTL layout.
 * `theme` is passed so this re-renders on a theme switch; `colors` returns the active palette.
 */
const ThemeProvider = ({ children, language }: { children: ReactNode; language: LanguageCode; theme: ThemeId }) => (
  <ConfigProvider
    direction={getDirection(language)}
    locale={language === "ar" ? arEG : enUS}
    theme={{
      token: {
        colorPrimary: colors.primary,
        colorLink: colors.primary,
        colorSuccess: colors.secondary,
        colorError: colors.danger,
        borderRadius: 8,
        fontSize: 14,
        // Montserrat has no Arabic letters; the browser falls back to Noto Sans Arabic for them
        fontFamily: "Montserrat, 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif",
        controlHeight: 42,
      },
      components: {
        Button: {
          primaryShadow: "none",
          defaultBorderColor: colors.secondary,
          defaultColor: colors.secondary,
          defaultHoverBorderColor: colors.secondaryDark,
          defaultHoverColor: colors.secondaryDark,
          fontWeight: 600,
        },
        Checkbox: { colorPrimary: colors.secondary, colorPrimaryHover: colors.secondaryDark },
        Radio: { colorPrimary: colors.secondary },
        Segmented: { itemSelectedBg: colors.primary, itemSelectedColor: "#fff" },
        Steps: { colorPrimary: colors.secondary },
        Table: { headerBg: colors.surface, headerColor: colors.primary },
        Form: { labelColor: colors.primary, labelFontSize: 13 },
      },
    }}
  >
    {children}
  </ConfigProvider>
);

export default ThemeProvider;
