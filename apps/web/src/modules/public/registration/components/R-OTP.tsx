import { useRegistration, t } from "@mf-bank/shared";
import OtpVerification from "@/shared/ui/components/OtpVerification";
import DetailsList from "@/shared/ui/components/DetailsList";

const ROTP = () => {
  const { verification, verifyOtp, resendOtp, loading, goToStep } = useRegistration();

  return (
    <div className="flex flex-col gap-5">
      <DetailsList items={verification?.Details} />
      <OtpVerification
        title={verification?.confScreenHeader ?? t("Enter OTP")}
        message={verification?.confScreenMsg}
        timerSeconds={Number(verification?.otpTimer) || 60}
        loading={loading}
        onSubmit={verifyOtp}
        onResend={resendOtp}
        onBack={() => goToStep(0)}
      />
    </div>
  );
};

export default ROTP;
