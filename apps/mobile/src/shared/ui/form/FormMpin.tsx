import { Controller, type FieldValues } from "react-hook-form";
import { View } from "react-native";
import { t, validators } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import BaseOTP from "../base/BaseOTP";
import BaseText from "../base/BaseText";
import type { FormFieldProps } from "./FormInput";

type Props<T extends FieldValues> = FormFieldProps<T> & { length: number; label?: string };

/** MPIN boxes (numbers only, masked, no autofill) bound to react-hook-form */
/** Default rule: required + digits only. Pass `rules` to add more (registration: strength, match). */
function FormMpin<T extends FieldValues>({ control, name, length, label = t("MPIN"), rules }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules ?? required("MPIN", validators.mpinFormat(length))}
      render={({ field, fieldState }) => (
        <View className="gap-2">
          <BaseText weight="medium" className="text-sm">
            {label}
          </BaseText>
          <BaseOTP
            kind="pin"
            autoFocus={false}
            length={length}
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        </View>
      )}
    />
  );
}

export default FormMpin;
