import { Form, type FormRule, type SelectProps } from "antd";
import BaseSelect from "../base/BaseSelect";

type FormSelectProps = { name: string; label?: string; rules?: FormRule[] } & SelectProps;

const FormSelect = ({ name, label, rules, ...rest }: FormSelectProps) => (
  <Form.Item name={name} label={label} rules={rules} className="mb-0">
    <BaseSelect {...rest} />
  </Form.Item>
);

export default FormSelect;
