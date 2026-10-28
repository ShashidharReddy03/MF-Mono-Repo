import type { ChangeEvent } from "react";
import { Form, type FormRule, type InputProps } from "antd";
import { formatInput, PASSWORD_MAX } from "@mf-bank/shared";
import BasePassword from "../base/BasePassword";

type FormPasswordProps = {
  name: string;
  label?: string;
  rules?: FormRule[];
  dependencies?: string[];
} & Omit<InputProps, "name">;

const FormPassword = ({ name, label, rules, dependencies, ...rest }: FormPasswordProps) => (
  <Form.Item
    name={name}
    label={label}
    rules={rules}
    dependencies={dependencies}
    getValueFromEvent={(e: ChangeEvent<HTMLInputElement>) => formatInput("password", e.target.value)}
    className="mb-0"
  >
    <BasePassword maxLength={PASSWORD_MAX} {...rest} />
  </Form.Item>
);

export default FormPassword;
