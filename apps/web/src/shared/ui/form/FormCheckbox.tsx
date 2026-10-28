import { Form, type FormRule } from "antd";
import type { ReactNode } from "react";
import BaseCheckbox from "../base/BaseCheckbox";

type FormCheckboxProps = { name: string; rules?: FormRule[]; children: ReactNode };

const FormCheckbox = ({ name, rules, children }: FormCheckboxProps) => (
  <Form.Item name={name} valuePropName="checked" rules={rules} className="mb-0">
    <BaseCheckbox>{children}</BaseCheckbox>
  </Form.Item>
);

export default FormCheckbox;
