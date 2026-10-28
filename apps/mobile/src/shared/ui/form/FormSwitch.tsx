import { View } from "react-native";
import { Controller, type FieldValues } from "react-hook-form";
import BaseSwitch from "../base/BaseSwitch";
import BaseText from "../base/BaseText";
import type { FormFieldProps } from "./FormInput";

type Props<T extends FieldValues> = FormFieldProps<T> & { label: string; onChange?: (v: boolean) => void };

/** On/off field with its label on the same row (web: FormSwitch) */
function FormSwitch<T extends FieldValues>({ control, name, rules, label, onChange }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <View className="flex-row items-center justify-between gap-4 rounded-xl border border-primary/10 bg-white px-4 py-3">
          <BaseText weight="medium" className="flex-1 text-sm">
            {label}
          </BaseText>
          <BaseSwitch
            value={!!field.value}
            accessibilityLabel={label}
            onValueChange={(v) => {
              field.onChange(v);
              onChange?.(v);
            }}
          />
        </View>
      )}
    />
  );
}

export default FormSwitch;
