import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BENEFICIARY_TYPE_LABEL, useAddBeneficiary, type BeneficiaryType, t } from "@mf-bank/shared";
import Screen from "@/shared/ui/components/Screen";
import Stepper from "@/shared/ui/components/Stepper";
import DetailsList from "@/shared/ui/components/DetailsList";
import OtpVerification from "@/shared/ui/components/OtpVerification";
import ResultPanel from "@/shared/ui/components/ResultPanel";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseText from "@/shared/ui/base/BaseText";
import BSameBankForm from "./components/B-SameBankForm";
import BOtherBankForm from "./components/B-OtherBankForm";

const STEPS = ["Details", "Confirm", "Done"];
const STEP_INDEX = { form: 0, confirm: 1, success: 2 } as const;

/** form → *_CONF (server validates + sends OTP) → confirm + OTP → success */
const AddBeneficiaryScreen = () => {
  const navigation = useNavigation();
  const a = useAddBeneficiary();

  return (
    <Screen edges={["bottom"]}>
      <Stepper steps={STEPS.map((s) => t(s))} current={STEP_INDEX[a.step]} />
      <BaseCard className="p-5">
        {a.step === "form" && (
          <View className="gap-5">
            <BaseSegmented<BeneficiaryType>
              value={a.type}
              onChange={a.setType}
              options={[
                { label: t("{{bank}} account", { bank: BENEFICIARY_TYPE_LABEL.SCU }), value: "SCU" },
                { label: t("{{bank}} account", { bank: BENEFICIARY_TYPE_LABEL.LOCAL }), value: "LOCAL" },
              ]}
            />
            {a.type === "SCU" ? (
              <BSameBankForm
                key="scu"
                verified={a.verified}
                verifying={a.verifying}
                loading={a.loading}
                onVerify={a.verifyAccount}
                onAccountChange={a.clearVerified}
                onSubmit={a.submitSameBank}
              />
            ) : (
              <BOtherBankForm key="local" bankOptions={a.bankOptions} loading={a.loading} onSubmit={a.submitOtherBank} />
            )}
          </View>
        )}

        {a.step === "confirm" && a.confirmation && (
          <View className="gap-5">
            <View>
              <BaseText weight="bold" className="text-base">
                {a.confirmation.confScreenHeader}
              </BaseText>
              <BaseText className="mt-1 text-sm text-muted">{a.confirmation.confScreenMsg}</BaseText>
            </View>
            <DetailsList items={a.confirmation.Details} />
            <View className="border-t border-primary/10 pt-5">
              <OtpVerification
                title={a.confirmation.otpScreenHeader}
                message={a.confirmation.otpScreenMsg}
                submitLabel={t("Confirm and add")}
                loading={a.loading}
                onSubmit={a.confirmOtp}
                onResend={a.resendOtp}
                onBack={a.backToForm}
                backLabel={t("Edit details")}
              />
            </View>
          </View>
        )}

        {a.step === "success" && a.success && (
          <ResultPanel
            title={a.success.finalScreenHeader}
            message={a.success.finalScreenMsg}
            details={a.success.Details}
            actionLabel={t("Go to beneficiaries")}
            onAction={() => navigation.goBack()}
            secondaryLabel={t("Add another")}
            onSecondary={a.reset}
          />
        )}
      </BaseCard>
    </Screen>
  );
};

export default AddBeneficiaryScreen;
