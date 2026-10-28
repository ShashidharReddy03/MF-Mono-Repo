import { I18nManager, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, initials, t, useAppSelector } from "@mf-bank/shared";
import Screen from "@/shared/ui/components/Screen";
import PreferencesPanel from "@/shared/ui/components/PreferencesPanel";
import BaseText from "@/shared/ui/base/BaseText";

/** Settings tab (after login): My profile entry + language and theme */
const SettingsScreen = () => {
  const navigation = useNavigation();
  const name = useAppSelector((s) => s.auth.meta?.CNAME) ?? "";
  return (
    <Screen edges={[]}>
      <Pressable
        onPress={() => navigation.navigate("Profile")}
        accessibilityRole="button"
        className="mb-7 flex-row items-center gap-3 rounded-2xl border border-primary/10 bg-white p-4"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary-light">
          <BaseText weight="bold" className="text-secondary-dark">
            {initials(name)}
          </BaseText>
        </View>
        <View className="flex-1">
          <BaseText weight="semibold" className="text-[15px]">
            {name}
          </BaseText>
          <BaseText className="text-xs text-muted">{t("My profile")}</BaseText>
        </View>
        <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.muted} />
      </Pressable>
      <PreferencesPanel />
    </Screen>
  );
};

export default SettingsScreen;
