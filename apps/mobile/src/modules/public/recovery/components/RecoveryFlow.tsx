import { useNavigation } from "@react-navigation/native";
import { useRecovery, type RecoveryMode, t } from "@mf-bank/shared";
import PublicShell from "@/shared/ui/components/PublicShell";
import Stepper from "@/shared/ui/components/Stepper";
import ResultPanel from "@/shared/ui/components/ResultPanel";
import OtpVerification from "@/shared/ui/components/OtpVerification";
import BaseCard from "@/shared/ui/base/BaseCard";
import RecoveryDetails from "./RecoveryDetails";
import RecoverySecurity from "./RecoverySecurity";
import RecoveryNewPassword from "./RecoveryNewPassword";

const COPY: Record<RecoveryMode, { title: string; intro: string }> = {
  password: { get title() { return t("Reset your password"); }, get intro() { return t("Confirm your identity and we'll let you set a new password."); } },
  username: { get title() { return t("Recover your username"); }, get intro() { return t("Confirm your identity and we'll show your username."); } },
};

/** One component drives both Forgot Password and Forgot Username (same as web) */
const RecoveryFlow = ({ mode }: { mode: RecoveryMode }) => {
  const navigation = useNavigation();
  const flow = useRecovery(mode);
  const lastStep = flow.steps.length - 1;
  const toLogin = () => navigation.navigate("Login");

  const renderStep = () => {
    if (flow.step === lastStep) {
      return (
        <ResultPanel
          title={flow.success?.finalScreenHeader ?? "Done"}
          message={flow.success?.finalScreenMsg}
          details={flow.success?.Details}
          actionLabel={t("Go to login")}
          onAction={toLogin}
        />
      );
    }
    switch (flow.step) {
      case 0:
        return <RecoveryDetails onSubmit={flow.submitDetails} loading={flow.loading} onCancel={toLogin} />;
      case 1:
        return <RecoverySecurity questions={flow.questions} onSubmit={flow.submitAnswers} loading={flow.loading} onBack={flow.back} />;
      case 2:
        return (
          <OtpVerification
            message={flow.otpMessage}
            timerSeconds={flow.otpTimer}
            loading={flow.loading}
            onSubmit={flow.submitOtp}
            onResend={flow.resendOtp}
            onBack={flow.back}
          />
        );
      default:
        return <RecoveryNewPassword onSubmit={flow.submitNewPassword} loading={flow.loading} />;
    }
  };

  return (
    <PublicShell title={COPY[mode].title} subtitle={COPY[mode].intro} onBack={toLogin}>
      <Stepper steps={flow.steps} current={flow.step} />
      <BaseCard className="p-5">{renderStep()}</BaseCard>
    </PublicShell>
  );
};

export default RecoveryFlow;
