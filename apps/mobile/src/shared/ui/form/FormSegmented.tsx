import { View } from "react-native";
import { Controller, type FieldValues } from "react-hook-form";
import BaseSegmented from "../base/BaseSegmented";
import BaseText from "../base/BaseText";
import type { FormFieldProps } from "./FormInput";

type Props<T extends FieldValues> = FormFieldProps<T> & { label?: string; options: { label: string; value: string }[] };

/** Mobile stand-in for the web FormRadioGroup (button style) */
function FormSegmented<T extends FieldValues>({ control, name, rules, label, options }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <View className="gap-1.5">
          {label && (
            <BaseText weight="medium" className="text-sm">
              {label}
            </BaseText>
          )}
          <BaseSegmented value={field.value as string} onChange={field.onChange} options={options} />
        </View>
      )}
    />
  );
}

export default FormSegmented;
