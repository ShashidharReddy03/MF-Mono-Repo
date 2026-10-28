import { Form } from "antd";
import { useOtpTimer, t } from "@mf-bank/shared";
import FormWrapper from "../form/FormWrapper";
import FormOTP from "../form/FormOTP";
import BaseButton from "../base/BaseButton";

type OtpVerificationProps = {
  title?: string;
  message?: string;
  submitLabel?: string;
  loading?: boolean;
  timerSeconds?: number;
  remainingAttempts?: number;
  resendDisabled?: boolean;
  onSubmit: (otp: string) => Promise<boolean> | void;
  onResend: () => Promise<boolean>;
  onBack?: () => void;
  backLabel?: string;
};

/**
 * Reusable OTP step: 6 masked digits, resend countdown, attempts left.
 * Used by login, registration, recovery and add-beneficiary.
 */
const OtpVerification = ({
  title = t("Enter OTP"),
  message = t("We sent a 6-digit code to your registered mobile number."),
  submitLabel = t("Verify"),
  loading,
  timerSeconds = 60,
  remainingAttempts,
  resendDisabled,
  onSubmit,
  onResend,
  onBack,
  backLabel = t("Back"),
}: OtpVerificationProps) => {
  const [form] = Form.useForm<{ otp: string }>();
  const timer = useOtpTimer(timerSeconds);

  const handleResend = async () => {
    form.resetFields();
    if (await onResend()) timer.restart();
  };

  const handleSubmit = async ({ otp }: { otp: string }) => {
    const ok = await onSubmit(otp);
    if (ok === false) form.resetFields();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{message}</p>
        {remainingAttempts !== undefined && (
          <p className={`mt-2 text-xs font-medium ${remainingAttempts <= 1 ? "text-danger" : "text-warning"}`}>
            Resend attempts left: {remainingAttempts}
          </p>
        )}
      </div>

      <FormWrapper form={form} onFinish={handleSubmit} className="flex flex-col gap-5">
        <FormOTP />
        <div className="text-center text-sm">
          {timer.canResend ? (
            <button
              type="button"
              disabled={resendDisabled}
              onClick={handleResend}
              className="font-semibold text-secondary hover:underline disabled:cursor-not-allowed disabled:text-muted"
            >
              {t("Resend OTP")}
            </button>
          ) : (
            <span className="text-muted">
              {t("Resend OTP in")} <span className="tabular-nums font-medium text-primary">{timer.label}</span>
            </span>
          )}
        </div>
        <BaseButton htmlType="submit" type="primary" block label={submitLabel} loading={loading} />
        {onBack && <BaseButton htmlType="button" type="text" block label={backLabel} onClick={onBack} />}
      </FormWrapper>
    </div>
  );
};

export default OtpVerification;
