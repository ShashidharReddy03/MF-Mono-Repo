import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, evaluatePassword } from "@mf-bank/shared";
import BaseText from "../base/BaseText";

/** Live password-policy checklist — rules come from @mf-bank/shared */
const PasswordChecklist = ({ password }: { password?: string }) => (
  <View className="gap-1.5 rounded-xl bg-white p-3">
    {evaluatePassword(password).map((r) => (
      <View key={r.key} className="flex-row items-center gap-2">
        <Ionicons
          name={r.passed ? "checkmark-circle" : "ellipse-outline"}
          size={16}
          color={r.passed ? colors.secondaryDark : colors.muted}
        />
        <BaseText className={`text-xs ${r.passed ? "text-secondary-dark" : "text-muted"}`}>{r.label}</BaseText>
      </View>
    ))}
  </View>
);

export default PasswordChecklist;
