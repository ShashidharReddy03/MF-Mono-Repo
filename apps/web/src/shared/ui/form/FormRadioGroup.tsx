import { Form, type FormRule, type RadioGroupProps } from "antd";
import BaseRadioGroup from "../base/BaseRadioGroup";

type Props = { name: string; label?: string; rules?: FormRule[] } & RadioGroupProps;

const FormRadioGroup = ({ name, label, rules, ...rest }: Props) => (
  <Form.Item name={name} label={label} rules={rules} className="mb-0">
    <BaseRadioGroup {...rest} />
  </Form.Item>
);

export default FormRadioGroup;
