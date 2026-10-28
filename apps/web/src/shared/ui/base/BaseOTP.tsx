import { Input } from "antd";
import type { OTPProps } from "antd/es/input/OTP";

/** 6 masked boxes, digits only */
const BaseOTP = (props: OTPProps) => (
  <Input.OTP
    length={6}
    size="large"
    mask="•"
    formatter={(v) => v.replace(/\D/g, "")}
    {...props}
  />
);

export default BaseOTP;
