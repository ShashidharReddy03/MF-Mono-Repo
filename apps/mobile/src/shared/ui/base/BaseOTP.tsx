import { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { colors, t } from "@mf-bank/shared";
import BaseText from "./BaseText";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  error?: string;
  masked?: boolean;
  /** "otp" lets iOS / Android offer the SMS code; "pin" (MPIN) turns autofill off */
  kind?: "otp" | "pin";
  autoFocus?: boolean;
};

/**
 * One hidden numeric input drawn as N boxes. Digits are masked (•) like the
 * demo's OTP field. Used for OTPs and for the MPIN.
 */
const BaseOTP = ({ value, onChange, length = 6, error, masked = true, kind = "otp", autoFocus = true }: Props) => {
  const ref = useRef<TextInput>(null);
  const isPin = kind === "pin";
  return (
    <View className="gap-2">
      <Pressable
        onPress={() => ref.current?.focus()}
        className="flex-row justify-between gap-2"
        accessibilityLabel={isPin ? t("MPIN") : t("One-time password")}
      >
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              className="h-14 flex-1 items-center justify-center rounded-xl border bg-white"
              style={{ borderColor: error ? colors.danger : active ? colors.secondary : `${colors.primary}26` }}
            >
              <BaseText weight="bold" className="text-xl">
                {ch ? (masked ? "•" : ch) : ""}
              </BaseText>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType={isPin ? "none" : "oneTimeCode"}
        autoComplete={isPin ? "off" : "sms-otp"}
        importantForAutofill={isPin ? "no" : "auto"}
        secureTextEntry={isPin}
        maxLength={length}
        autoFocus={autoFocus}
        contextMenuHidden
        caretHidden
        className="absolute h-px w-px opacity-0"
      />
      {error && <BaseText className="text-center text-xs text-danger">{error}</BaseText>}
    </View>
  );
};

export default BaseOTP;
