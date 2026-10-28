import type { ReactNode } from "react";
import { Provider } from "@ant-design/react-native";
import { colors, type ThemeId } from "@mf-bank/shared";
import { FONTS } from "@/core/config/fonts";

/**
 * @ant-design/react-native theme — same brand tokens as the web antd theme.
 * Built per render so colours follow the selected theme and the font follows the language.
 */
const buildTheme = () => ({
  brand_primary: colors.primary,
  brand_primary_tap: colors.primaryDark,
  brand_success: colors.secondary,
  brand_error: colors.danger,
  brand_warning: colors.warning,
  primary_button_fill: colors.primary,
  primary_button_fill_tap: colors.primaryDark,
  color_text_base: colors.primary,
  radius_md: 10,
  button_height: 50,
  button_font_size: 15,
  font_family: FONTS.semibold,
});

// `theme` is passed so this re-renders on a theme switch
const ThemeProvider = ({ children }: { children: ReactNode; theme: ThemeId }) => <Provider theme={buildTheme()}>{children}</Provider>;

export default ThemeProvider;
