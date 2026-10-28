import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { BENEFICIARY_TYPE_LABEL, useAddBeneficiary, type BeneficiaryType, t } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseButton from "@/shared/ui/base/BaseButton";
import DetailsList from "@/shared/ui/components/DetailsList";
import OtpVerification from "@/shared/ui/components/OtpVerification";
import ResultPanel from "@/shared/ui/components/ResultPanel";
import Stepper from "@/shared/ui/components/Stepper";
import { ROUTES } from "@/app/routes/routes";
import BSameBankForm from "./components/B-SameBankForm";
import BOtherBankForm from "./components/B-OtherBankForm";

const STEPS = ["Details", "Confirm", "Done"]; // translated at render
const STEP_INDEX = { form: 0, confirm: 1, success: 2 } as const;

const AddBeneficiaryPage = () => {
  const navigate = useNavigate();
  const a = useAddBeneficiary();
  const back = () => navigate(ROUTES.private.beneficiaries);

  return (
    <>
      <PageHeader
        title={t("Add beneficiary")}
        description={t("New beneficiaries are confirmed with a one-time password.")}
        actions={a.step !== "success" && <BaseButton icon={<ArrowLeftOutlined className="rtl:rotate-180" />} label={t("Back")} onClick={back} size="middle" />}
      />

      <div className="mx-auto max-w-xl rounded-2xl border border-primary/10 bg-white p-6 sm:p-8">
        <Stepper steps={STEPS.map((s) => t(s))} current={STEP_INDEX[a.step]} />

        {a.step === "form" && (
          <div className="mt-6 flex flex-col gap-5">
            <BaseSegmented<BeneficiaryType>
              block
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
          </div>
        )}

        {a.step === "confirm" && a.confirmation && (
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <h2 className="text-base font-semibold text-primary">{a.confirmation.confScreenHeader}</h2>
              <p className="mt-1 text-sm text-muted">{a.confirmation.confScreenMsg}</p>
            </div>
            <DetailsList items={a.confirmation.Details} />
            <div className="border-t border-primary/10 pt-6">
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
            </div>
          </div>
        )}

        {a.step === "success" && a.success && (
          <div className="mt-6">
            <ResultPanel
              title={a.success.finalScreenHeader}
              message={a.success.finalScreenMsg}
              details={a.success.Details}
              actionLabel={t("Go to beneficiaries")}
              onAction={back}
              secondaryLabel={t("Add another")}
              onSecondary={a.reset}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AddBeneficiaryPage;
