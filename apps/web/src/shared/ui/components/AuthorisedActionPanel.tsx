import type { AuthorisedAction } from "@mf-bank/shared";
import { t } from "@mf-bank/shared";
import BaseButton from "../base/BaseButton";
import DetailsList from "./DetailsList";
import OtpVerification from "./OtpVerification";
import ResultPanel from "./ResultPanel";

type Props = {
  action: AuthorisedAction;
  /** OTP button label, e.g. "Confirm transfer" */
  submitLabel?: string;
  /** Result screen buttons */
  doneLabel: string;
  onDone: () => void;
  againLabel?: string;
  onAgain?: () => void;
};

/**
 * Web view of the shared confirm → OTP → result engine (useAuthorisedAction).
 * Used by fund transfer and every My Profile change; mobile has its twin.
 */
const AuthorisedActionPanel = ({ action, submitLabel = t("Confirm"), doneLabel, onDone, againLabel, onAgain }: Props) => {
  const { step, confirmation, result } = action;

  if (step === "confirm") {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-semibold text-primary">{confirmation?.confScreenHeader ?? t("Confirm details")}</h2>
          {confirmation?.confScreenMsg && <p className="mt-1 text-sm text-muted">{confirmation.confScreenMsg}</p>}
        </div>
        <DetailsList items={confirmation?.Details} />
        <div className="grid grid-cols-2 gap-3">
          <BaseButton label={t("Edit details")} onClick={action.back} />
          <BaseButton type="primary" label={submitLabel} loading={action.loading} onClick={() => void action.confirm()} />
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-6">
        {confirmation?.Details?.length ? <DetailsList items={confirmation.Details} /> : null}
        <OtpVerification
          title={confirmation?.otpScreenHeader ?? t("Enter OTP")}
          message={confirmation?.otpScreenMsg ?? action.otpMessage}
          submitLabel={submitLabel}
          loading={action.loading}
          remainingAttempts={action.remainingAttempts}
          resendDisabled={action.resendDisabled}
          onSubmit={action.submitOtp}
          onResend={action.resendOtp}
          onBack={action.back}
          backLabel={t("Back")}
        />
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <ResultPanel
        status={result.success ? "success" : "error"}
        title={result.header}
        message={result.message}
        details={result.details}
        actionLabel={doneLabel}
        onAction={onDone}
        secondaryLabel={againLabel}
        onSecondary={onAgain}
      />
    );
  }

  return null;
};

export default AuthorisedActionPanel;
