import { Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import { useOtpTimer, t } from "@mf-bank/shared";
import FormOTP from "../form/FormOTP";
import BaseButton from "../base/BaseButton";
import BaseText from "../base/BaseText";

type Props = {
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

/** Reusable OTP step — mobile twin of the web OtpVerification */
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
}: Props) => {
  const { control, handleSubmit, reset } = useForm<{ otp: string }>({ defaultValues: { otp: "" } });
  const timer = useOtpTimer(timerSeconds);

  const resend = async () => {
    reset({ otp: "" });
    if (await onResend()) timer.restart();
  };

  const submit = handleSubmit(async ({ otp }) => {
    const ok = await onSubmit(otp);
    if (ok === false) reset({ otp: "" });
  });

  return (
    <View className="gap-5">
      <View className="items-center">
        <BaseText weight="bold" className="text-lg">
          {title}
        </BaseText>
        <BaseText className="mt-1 text-center text-sm text-muted">{message}</BaseText>
        {remainingAttempts !== undefined && (
          <BaseText weight="medium" className={`mt-2 text-xs ${remainingAttempts <= 1 ? "text-danger" : "text-warning"}`}>
            {t("Resend attempts left: {{n}}", { n: remainingAttempts })}
          </BaseText>
        )}
      </View>

      <FormOTP control={control} name="otp" />

      <View className="items-center">
        {timer.canResend ? (
          <Pressable onPress={resend} disabled={resendDisabled} hitSlop={8}>
            <BaseText weight="semibold" className={resendDisabled ? "text-muted" : "text-secondary"}>
              {t("Resend OTP")}
            </BaseText>
          </Pressable>
        ) : (
          <BaseText className="text-sm text-muted">
            {t("Resend OTP in")} <BaseText weight="semibold">{timer.label}</BaseText>
          </BaseText>
        )}
      </View>

      <BaseButton label={submitLabel} onPress={submit} loading={loading} />
      {onBack && <BaseButton label={backLabel} variant="ghost" onPress={onBack} />}
    </View>
  );
};

export default OtpVerification;
