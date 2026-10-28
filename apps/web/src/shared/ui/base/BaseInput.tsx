import { Input, type InputProps } from "antd";

const BaseInput = ({ className, ...props }: InputProps) => (
  <Input size="large" autoComplete="off" spellCheck={false} {...props} className={`base-input ${className ?? ""}`} />
);

export default BaseInput;
