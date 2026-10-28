import type { ReactNode } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import BaseCheckbox from "../base/BaseCheckbox";
import type { FormFieldProps } from "./FormInput";

function FormCheckbox<T extends FieldValues>({ control, name, rules, children }: FormFieldProps<T> & { children: ReactNode }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <BaseCheckbox checked={!!field.value} onChange={field.onChange} error={fieldState.error?.message}>
          {children}
        </BaseCheckbox>
      )}
    />
  );
}

export default FormCheckbox;
