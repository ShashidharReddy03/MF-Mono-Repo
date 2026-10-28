import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Control, FieldValues, Path } from "react-hook-form";
import { colors, validators, t } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import FormInput from "../form/FormInput";
import BaseText from "../base/BaseText";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  value: string;
  onRefresh: () => void;
  validate: (input: string) => boolean;
};

/** Rotated, noisy characters — same friction layer as the web captcha */
function CaptchaField<T extends FieldValues>({ control, name, value, onRefresh, validate }: Props<T>) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-[50px] flex-1 flex-row items-center gap-2">
        <View
          className="h-full flex-1 flex-row items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/30 bg-white"
          accessibilityLabel={t("Captcha image")}
          importantForAccessibility="no-hide-descendants"
        >
          {value.split("").map((ch, i) => (
            <BaseText
              key={`${ch}-${i}`}
              weight="bold"
              className="mx-px text-lg"
              style={{ transform: [{ rotate: `${(i % 2 ? 1 : -1) * (6 + i * 2)}deg` }, { translateY: i % 3 === 0 ? -2 : 2 }] }}
            >
              {ch}
            </BaseText>
          ))}
          <View className="absolute left-2 right-2 top-1/2 h-px bg-primary/30" style={{ transform: [{ rotate: "-6deg" }] }} />
        </View>
        <Pressable onPress={onRefresh} hitSlop={10} accessibilityLabel={t("New captcha")}>
          <Ionicons name="refresh" size={22} color={colors.secondary} />
        </Pressable>
      </View>
      <View className="flex-1">
        <FormInput
          control={control}
          name={name}
          inputType="alphanumeric"
          placeholder={t("Enter captcha")}
          autoCapitalize="characters"
          maxLength={6}
          rules={required("Captcha", (v) => (validate(String(v ?? "")) ? undefined : "Captcha doesn't match"), validators.minLength(6))}
        />
      </View>
    </View>
  );
}

export default CaptchaField;
