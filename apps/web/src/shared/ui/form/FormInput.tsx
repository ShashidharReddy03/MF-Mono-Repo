import type { ChangeEvent } from "react";
import { Form, type FormRule, type InputProps } from "antd";
import { formatInput, type DynamicInputType } from "@mf-bank/shared";
import BaseInput from "../base/BaseInput";

type FormInputProps = {
  name: string;
  label?: string;
  rules?: FormRule[];
  inputType?: DynamicInputType;
  dependencies?: string[];
  extra?: string;
  validateTrigger?: string | string[];
} & Omit<InputProps, "name">;

/** Every keystroke is sanitised by the shared inputFormatters */
const LTR_TYPES: DynamicInputType[] = ["number", "email", "username", "password", "amount"];

const FormInput = ({ name, label, rules, inputType = "text", dependencies, extra, validateTrigger, ...rest }: FormInputProps) => (
  <Form.Item
    name={name}
    label={label}
    rules={rules}
    dependencies={dependencies}
    extra={extra}
    validateTrigger={validateTrigger}
    getValueFromEvent={(e: ChangeEvent<HTMLInputElement>) => formatInput(inputType, e.target.value)}
    className="mb-0"
  >
    <BaseInput
      inputMode={inputType === "number" ? "numeric" : undefined}
      // digits, emails and usernames read left-to-right even in Arabic
      dir={LTR_TYPES.includes(inputType) ? "ltr" : undefined}
      {...rest}
    />
  </Form.Item>
);

export default FormInput;
