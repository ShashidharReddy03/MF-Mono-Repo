import { Button, type ButtonProps } from "antd";

export type BaseButtonProps = { label: string } & Omit<ButtonProps, "children">;

/** All buttons in the app go through here — one place to restyle */
const BaseButton = ({ label, className, size = "large", ...rest }: BaseButtonProps) => (
  <Button size={size} {...rest} className={`base-button ${className ?? ""}`}>
    {label}
  </Button>
);

export default BaseButton;
