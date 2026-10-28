import { View } from "react-native";
import { t, type AuthorisedAction } from "@mf-bank/shared";
import BaseButton from "../base/BaseButton";
import BaseText from "../base/BaseText";
import DetailsList from "./DetailsList";
import OtpVerification from "./OtpVerification";
import ResultPanel from "./ResultPanel";

type Props = {
  action: AuthorisedAction;
  submitLabel?: string;
  doneLabel: string;
  onDone: () => void;
  againLabel?: string;
  onAgain?: () => void;
};

/**
 * Mobile view of the shared confirm → OTP → result engine (useAuthorisedAction).
 * Same props and behaviour as the web AuthorisedActionPanel.
 */
const AuthorisedActionPanel = ({ action, submitLabel = t("Confirm"), doneLabel, onDone, againLabel, onAgain }: Props) => {
  const { step, confirmation, result } = action;

  if (step === "confirm") {
    return (
      <View className="gap-5">
        <View>
          <BaseText weight="bold" className="text-base">
            {confirmation?.confScreenHeader ?? t("Confirm details")}
          </BaseText>
          {confirmation?.confScreenMsg && <BaseText className="mt-1 text-sm text-muted">{confirmation.confScreenMsg}</BaseText>}
        </View>
        <DetailsList items={confirmation?.Details} />
        <BaseButton label={submitLabel} loading={action.loading} onPress={() => void action.confirm()} />
        <BaseButton label={t("Edit details")} variant="ghost" onPress={action.back} />
      </View>
    );
  }

  if (step === "otp") {
    return (
      <View className="gap-5">
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
      </View>
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
