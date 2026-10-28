import { useNavigate } from "react-router-dom";
import { useRecovery, type RecoveryMode, t } from "@mf-bank/shared";
import { ROUTES } from "@/app/routes/routes";
import Stepper from "@/shared/ui/components/Stepper";
import ResultPanel from "@/shared/ui/components/ResultPanel";
import OtpVerification from "@/shared/ui/components/OtpVerification";
import RecoveryDetails from "./RecoveryDetails";
import RecoverySecurity from "./RecoverySecurity";
import RecoveryNewPassword from "./RecoveryNewPassword";

const COPY: Record<RecoveryMode, { title: string; intro: string }> = {
  password: {
    get title() { return t("Reset your password"); },
    get intro() { return t("Confirm your identity and we'll let you set a new password."); },
  },
  username: {
    get title() { return t("Recover your username"); },
    get intro() { return t("Confirm your identity and we'll show your username."); },
  },
};

/** One component drives both Forgot Password and Forgot Username */
const RecoveryFlow = ({ mode }: { mode: RecoveryMode }) => {
  const navigate = useNavigate();
  const flow = useRecovery(mode);
  const lastStep = flow.steps.length - 1;
  const toLogin = () => navigate(ROUTES.public.login, { replace: true });

  const renderStep = () => {
    if (flow.step === lastStep) {
      return (
        <ResultPanel
          title={flow.success?.finalScreenHeader ?? t("Done")}
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
        return (
          <RecoverySecurity questions={flow.questions} onSubmit={flow.submitAnswers} loading={flow.loading} onBack={flow.back} />
        );
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-primary">{COPY[mode].title}</h2>
        <p className="mt-1 text-sm text-muted">{COPY[mode].intro}</p>
      </div>
      <Stepper steps={flow.steps} current={flow.step} />
      {renderStep()}
    </div>
  );
};

export default RecoveryFlow;
