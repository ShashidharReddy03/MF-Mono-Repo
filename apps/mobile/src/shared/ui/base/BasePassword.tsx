import { forwardRef, useState } from "react";
import { Pressable, type TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, PASSWORD_MAX, t } from "@mf-bank/shared";
import BaseInput, { type BaseInputProps } from "./BaseInput";

/** Masked by default; the OS secure keyboard is used (no keylogging suggestions) */
const BasePassword = forwardRef<TextInput, BaseInputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <BaseInput
      ref={ref}
      secureTextEntry={!visible}
      textContentType="oneTimeCode" // stops iOS offering to save/autofill the password
      maxLength={PASSWORD_MAX}
      right={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          accessibilityLabel={visible ? t("Hide password") : t("Show password")}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
        </Pressable>
      }
      {...props}
    />
  );
});

BasePassword.displayName = "BasePassword";
export default BasePassword;
