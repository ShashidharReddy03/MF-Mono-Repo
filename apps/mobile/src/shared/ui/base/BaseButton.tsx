import { Button } from "@ant-design/react-native";
import type { ReactNode } from "react";
import { colors } from "@mf-bank/shared";
import BaseText from "./BaseText";

export type BaseButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  size?: "large" | "small";
  icon?: ReactNode;
};

/** A function so the colours follow the active theme */
const variants = () => ({
  primary: { type: "primary" as const, bg: colors.primary, border: colors.primary, text: "#FFFFFF" },
  secondary: { type: undefined, bg: "#FFFFFF", border: `${colors.primary}33`, text: colors.primary },
  ghost: { type: undefined, bg: "transparent", border: "transparent", text: colors.primary },
  danger: { type: undefined, bg: "#FFFFFF", border: `${colors.danger}55`, text: colors.danger },
});

/** All buttons in the app go through here — wraps @ant-design/react-native Button */
const BaseButton = ({ label, onPress, variant = "primary", loading, disabled, size = "large", icon }: BaseButtonProps) => {
  const v = variants()[variant];
  return (
    <Button
      type={v.type}
      loading={loading}
      disabled={disabled || loading}
      onPress={onPress}
      icon={icon}
      accessibilityLabel={label}
      style={{
        backgroundColor: v.bg,
        borderColor: v.border,
        borderRadius: 12,
        height: size === "large" ? 50 : 38,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <BaseText weight="semibold" style={{ color: v.text, fontSize: size === "large" ? 15 : 13 }}>
        {label}
      </BaseText>
    </Button>
  );
};

export default BaseButton;
