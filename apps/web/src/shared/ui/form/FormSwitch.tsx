import type { ReactNode } from "react";
import { Form, type FormRule } from "antd";
import BaseSwitch from "../base/BaseSwitch";

type Props = { name: string; label?: ReactNode; rules?: FormRule[]; onChange?: (checked: boolean) => void };

/** On/off field with its label on the same row */
const FormSwitch = ({ name, label, rules, onChange }: Props) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/10 px-4 py-3">
    <span className="text-sm font-medium text-primary">{label}</span>
    <Form.Item name={name} valuePropName="checked" rules={rules} className="mb-0">
      <BaseSwitch onChange={onChange} />
    </Form.Item>
  </div>
);

export default FormSwitch;
