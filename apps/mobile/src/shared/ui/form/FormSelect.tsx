import { Controller, type FieldValues } from "react-hook-form";
import type { SelectOption } from "@mf-bank/shared";
import BaseSelect from "../base/BaseSelect";
import type { FormFieldProps } from "./FormInput";

type Props<T extends FieldValues> = FormFieldProps<T> & { label?: string; placeholder?: string; options: SelectOption[] };

function FormSelect<T extends FieldValues>({ control, name, rules, ...rest }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <BaseSelect value={field.value as string} onChange={field.onChange} error={fieldState.error?.message} {...rest} />
      )}
    />
  );
}

export default FormSelect;
