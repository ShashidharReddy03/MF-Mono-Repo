import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Modal } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  getLanguage,
  getPalette,
  selectIsAuthenticated,
  SUPPORTED_LANGUAGES,
  t,
  THEME_IDS,
  THEMES,
  useAppSelector,
  type LanguageCode,
  type ThemeId,
} from "@mf-bank/shared";
import { setMobileLanguage } from "@/core/i18n/language";
import { setMobileTheme, useTheme } from "@/core/i18n/theme";
import BaseText from "../base/BaseText";

const Option = ({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: ReactNode }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    className={`flex-row items-center gap-3 rounded-2xl border p-4 ${selected ? "border-secondary bg-secondary-light" : "border-primary/10 bg-white"}`}
  >
    {children}
    <View className="ms-auto">
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />
      ) : (
        <Ionicons name="ellipse-outline" size={22} color={colors.muted} />
      )}
    </View>
  </Pressable>
);

/** Preview of a theme in its own colours, whatever theme is active */
const ThemeSwatch = ({ id }: { id: ThemeId }) => {
  const p = getPalette(id);
  return (
    <View className="h-10 w-16 flex-row overflow-hidden rounded-lg border border-black/5">
      <View style={{ flex: 2, backgroundColor: p.primary }} />
      <View style={{ flex: 1, backgroundColor: p.secondary }} />
      <View style={{ flex: 1, backgroundColor: p.surface }} />
    </View>
  );
};

const SectionTitle = ({ title, hint }: { title: string; hint: string }) => (
  <View className="mb-3">
    <BaseText weight="bold" className="text-base">
      {title}
    </BaseText>
    <BaseText className="mt-0.5 text-xs text-muted">{hint}</BaseText>
  </View>
);

/**
 * Language + theme preferences, used by the Settings tab (after login) and the
 * Settings screen before login. Theme applies instantly; language restarts the
 * app (needed for right-to-left layout), which also ends a signed-in session —
 * the user is told before confirming.
 */
const PreferencesPanel = () => {
  const theme = useTheme();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const language = getLanguage();

  const chooseLanguage = (code: LanguageCode) => {
    if (code === language) return;
    const label = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code;
    Modal.alert(
      label,
      isAuth
        ? t("The app will restart to change the language. You will need to sign in again.")
        : t("The app will restart to change the language."),
      [
        { text: t("Cancel"), style: "cancel" },
        { text: t("Continue"), onPress: () => void setMobileLanguage(code) },
      ],
    );
  };

  return (
    <View className="gap-7">
      <View>
        <SectionTitle title={t("Language")} hint={t("Choose the language for menus, messages and forms.")} />
        <View className="gap-2.5" accessibilityRole="radiogroup">
          {SUPPORTED_LANGUAGES.map((l) => (
            <Option key={l.code} selected={language === l.code} onPress={() => chooseLanguage(l.code)}>
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <BaseText weight="bold" className="text-sm">
                  {l.code.toUpperCase()}
                </BaseText>
              </View>
              <BaseText weight="semibold" className="text-[15px]">
                {l.label}
              </BaseText>
            </Option>
          ))}
        </View>
      </View>

      <View>
        <SectionTitle title={t("Theme")} hint={t("Choose the colours used across the app.")} />
        <View className="gap-2.5" accessibilityRole="radiogroup">
          {THEME_IDS.map((id) => (
            <Option key={id} selected={theme === id} onPress={() => void setMobileTheme(id)}>
              <ThemeSwatch id={id} />
              <View>
                <BaseText weight="semibold" className="text-[15px]">
                  {THEMES[id].label}
                </BaseText>
                {id === "classic" && <BaseText className="text-xs text-muted">{t("Default")}</BaseText>}
              </View>
            </Option>
          ))}
        </View>
      </View>

      <BaseText className="text-xs text-muted">{t("Your choices are saved on this device only.")}</BaseText>
    </View>
  );
};

export default PreferencesPanel;
