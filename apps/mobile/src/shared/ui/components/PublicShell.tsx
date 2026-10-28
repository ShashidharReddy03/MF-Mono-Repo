import type { ReactNode } from "react";
import { I18nManager, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Logo from "./Logo";
import LanguageSwitch from "./LanguageSwitch";
import BaseText from "../base/BaseText";
import { colors, t } from "@mf-bank/shared";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  footer?: ReactNode;
  /** hide the language/settings shortcuts (on the Settings screen itself) */
  hideSettings?: boolean;
};

/**
 * Pre-login layout (mobile version of the web PublicLayout):
 * navy brand band with the security reminder, form sheet below.
 */
const PublicShell = ({ title, subtitle, children, onBack, footer, hideSettings }: Props) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView className="flex-1 bg-primary" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="grow" bounces={false}>
        <View className="px-6 pb-10" style={{ paddingTop: insets.top + 16 }}>
          <View className="flex-row items-center justify-between">
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12} accessibilityLabel={t("Back")} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Ionicons name={I18nManager.isRTL ? "chevron-forward" : "chevron-back"} size={22} color="#fff" />
              </Pressable>
            ) : (
              <Logo light />
            )}
            {!hideSettings && (
              <View className="flex-row items-center gap-2">
                <LanguageSwitch light />
                <Pressable
                  onPress={() => navigation.navigate("Preferences")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t("Settings")}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white/10"
                >
                  <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
          <BaseText weight="bold" className="mt-8 text-2xl text-white">
            {title}
          </BaseText>
          {subtitle && <BaseText className="mt-1 text-sm text-white/70">{subtitle}</BaseText>}
        </View>

        <View className="-mt-4 flex-1 rounded-t-3xl bg-surface px-5 pt-6" style={{ paddingBottom: insets.bottom + 24 }}>
          {children}
          {footer}
          <View className="mt-8 flex-row items-start gap-2 px-2">
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
            <BaseText className="flex-1 text-2xs text-muted">
              {t("MF Bank will never ask for your password or OTP by phone, SMS or email.")}
            </BaseText>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PublicShell;
