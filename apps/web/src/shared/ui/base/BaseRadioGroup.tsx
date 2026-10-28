import { Radio, type RadioGroupProps } from "antd";

const BaseRadioGroup = (props: RadioGroupProps) => (
  <Radio.Group optionType="button" buttonStyle="solid" size="large" {...props} />
);

export default BaseRadioGroup;
