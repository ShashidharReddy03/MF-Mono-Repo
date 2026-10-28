import { Controller, type FieldValues } from "react-hook-form";
import { validators } from "@mf-bank/shared";
import { required } from "@/core/utils/rhfRules";
import BaseOTP from "../base/BaseOTP";
import type { FormFieldProps } from "./FormInput";

function FormOTP<T extends FieldValues>({ control, name }: Omit<FormFieldProps<T>, "rules">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={required("OTP", validators.otp())}
      render={({ field, fieldState }) => (
        <BaseOTP value={(field.value as string) ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
      )}
    />
  );
}

export default FormOTP;
