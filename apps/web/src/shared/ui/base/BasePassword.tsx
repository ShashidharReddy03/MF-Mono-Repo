import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Input, type InputProps } from "antd";

const BasePassword = ({ className, ...props }: InputProps) => (
  <Input.Password
    dir="ltr"
    size="large"
    autoComplete="new-password"
    spellCheck={false}
    {...props}
    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
    className={`base-input ${className ?? ""}`}
  />
);

export default BasePassword;
