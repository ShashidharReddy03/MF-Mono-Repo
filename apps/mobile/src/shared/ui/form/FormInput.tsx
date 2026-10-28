import { Controller, type Control, type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { formatInput, type DynamicInputType } from "@mf-bank/shared";
import BaseInput, { type BaseInputProps } from "../base/BaseInput";

export type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
};

type Props<T extends FieldValues> = FormFieldProps<T> & { inputType?: DynamicInputType } & Omit<BaseInputProps, "value" | "onChangeText">;

/** Every keystroke is sanitised by the shared inputFormatters (same as web) */
function FormInput<T extends FieldValues>({ control, name, rules, inputType = "text", ...rest }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <BaseInput
          value={(field.value as string) ?? ""}
          onChangeText={(text) => field.onChange(formatInput(inputType, text))}
          onBlur={field.onBlur}
          ref={field.ref}
          error={fieldState.error?.message}
          keyboardType={inputType === "number" ? "number-pad" : inputType === "email" ? "email-address" : "default"}
          {...rest}
        />
      )}
    />
  );
}

export default FormInput;
