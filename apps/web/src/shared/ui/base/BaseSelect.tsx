import { Select, type SelectProps } from "antd";

const BaseSelect = ({ className, ...props }: SelectProps) => (
  <Select size="large" showSearch={{ optionFilterProp: "label" }} {...props} className={`w-full ${className ?? ""}`} />
);

export default BaseSelect;
