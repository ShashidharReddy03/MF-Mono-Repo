import { Pressable } from "react-native";
import { Modal } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, getLanguage, SUPPORTED_LANGUAGES, t } from "@mf-bank/shared";
import { setMobileLanguage } from "@/core/i18n/language";
import BaseText from "../base/BaseText";

/**
 * Shows the OTHER language's name in its own script ("العربية" / "English").
 * Switching restarts the app (needed for right-to-left layout), so it's only
 * offered before login.
 */
const LanguageSwitch = ({ light = false }: { light?: boolean }) => {
  const next = SUPPORTED_LANGUAGES.find((l) => l.code !== getLanguage()) ?? SUPPORTED_LANGUAGES[0];
  const color = light ? "#FFFFFF" : undefined;

  const confirm = () =>
    Modal.alert(next.label, t("The app will restart to change the language."), [
      { text: t("Cancel"), style: "cancel" },
      { text: t("Continue"), onPress: () => void setMobileLanguage(next.code) },
    ]);

  return (
    <Pressable
      onPress={confirm}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={t("Change language")}
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${light ? "bg-white/10" : "bg-surface"}`}
    >
      <Ionicons name="globe-outline" size={16} color={color ?? colors.primary} />
      <BaseText weight="semibold" className={`text-sm ${light ? "text-white" : ""}`}>
        {next.label}
      </BaseText>
    </Pressable>
  );
};

export default LanguageSwitch;
