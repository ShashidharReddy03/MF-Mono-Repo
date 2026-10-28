import { forwardRef, useState, type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@mf-bank/shared";
import { FONTS } from "@/core/config/fonts";
import BaseText from "./BaseText";

export type BaseInputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  right?: ReactNode;
  left?: ReactNode;
};

/**
 * Secure-by-default text input: no autocorrect, no autofill suggestions,
 * no copy/paste menu. Shows label, error and hint consistently.
 */
const BaseInput = forwardRef<TextInput, BaseInputProps>(({ label, error, hint, right, left, style, onFocus, onBlur, ...rest }, ref) => {
  const [focused, setFocused] = useState(false);
  const border = error ? colors.danger : focused ? colors.secondary : `${colors.primary}26`;

  return (
    <View className="gap-1.5">
      {label && (
        <BaseText weight="medium" className="text-sm">
          {label}
        </BaseText>
      )}
      <View className="h-[50px] flex-row items-center rounded-xl border bg-white px-3.5" style={{ borderColor: border }}>
        {left}
        <TextInput
          ref={ref}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
          spellCheck={false}
          contextMenuHidden
          placeholderTextColor={`${colors.muted}99`}
          className="flex-1 text-[15px] text-primary"
          style={[{ fontFamily: FONTS.medium, paddingVertical: 0 }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {right}
      </View>
      {error ? (
        <BaseText className="text-xs text-danger">{error}</BaseText>
      ) : hint ? (
        <BaseText className="text-xs text-muted">{hint}</BaseText>
      ) : null}
    </View>
  );
});

BaseInput.displayName = "BaseInput";
export default BaseInput;
