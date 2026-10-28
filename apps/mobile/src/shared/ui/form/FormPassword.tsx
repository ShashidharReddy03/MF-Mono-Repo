import { Controller, type FieldValues } from "react-hook-form";
import { formatInput } from "@mf-bank/shared";
import BasePassword from "../base/BasePassword";
import type { BaseInputProps } from "../base/BaseInput";
import type { FormFieldProps } from "./FormInput";

type Props<T extends FieldValues> = FormFieldProps<T> & Omit<BaseInputProps, "value" | "onChangeText">;

function FormPassword<T extends FieldValues>({ control, name, rules, ...rest }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <BasePassword
          value={(field.value as string) ?? ""}
          onChangeText={(text) => field.onChange(formatInput("password", text))}
          onBlur={field.onBlur}
          ref={field.ref}
          error={fieldState.error?.message}
          {...rest}
        />
      )}
    />
  );
}

export default FormPassword;
