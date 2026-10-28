import { Form } from "antd";
import { validators } from "@mf-bank/shared";
import { required } from "@/core/utils/antdRules";
import BaseOTP from "../base/BaseOTP";

const FormOTP = ({ name = "otp", autoFocus = true }: { name?: string; autoFocus?: boolean }) => (
  <Form.Item name={name} rules={required("OTP", validators.otp())} className="mb-0 flex justify-center">
    <BaseOTP autoFocus={autoFocus} />
  </Form.Item>
);

export default FormOTP;
