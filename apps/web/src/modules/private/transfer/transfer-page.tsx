import { useNavigate } from "react-router-dom";
import { t, TRANSFER_KIND_LABEL, useFundTransfer, type TransferKind } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import Stepper from "@/shared/ui/components/Stepper";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import { ROUTES } from "@/app/routes/routes";
import TOwnForm from "./components/T-OwnForm";
import TSameBankForm from "./components/T-SameBankForm";
import TOtherBankForm from "./components/T-OtherBankForm";

const STEP_INDEX = { idle: 0, confirm: 1, otp: 1, result: 2 } as const;

/** Fund transfer — logic in the shared useFundTransfer hook, same as mobile */
const TransferPage = () => {
  const navigate = useNavigate();
  const ft = useFundTransfer();
  const { step } = ft.action;

  return (
    <>
      <PageHeader title={t("Fund transfer")} description={t("Move money between your accounts or pay someone else.")} />

      <div className="mx-auto max-w-2xl rounded-2xl border border-primary/10 bg-white p-6 sm:p-8">
        <Stepper steps={[t("Details"), t("Confirm"), t("Done")]} current={STEP_INDEX[step]} />

        <div className="mt-6">
          {step === "idle" ? (
            <div className="flex flex-col gap-5">
              <BaseSegmented<TransferKind>
                block
                value={ft.kind}
                onChange={ft.setKind}
                options={ft.kinds.map((k) => ({ label: TRANSFER_KIND_LABEL[k], value: k }))}
              />
              {/* key: a fresh form per transfer type */}
              {ft.kind === "OWN" && <TOwnForm key="own" ft={ft} />}
              {ft.kind === "SCU" && <TSameBankForm key="scu" ft={ft} />}
              {ft.kind === "LOCAL" && <TOtherBankForm key="local" ft={ft} />}
            </div>
          ) : (
            <AuthorisedActionPanel
              action={ft.action}
              submitLabel={t("Confirm transfer")}
              doneLabel={t("Go to dashboard")}
              onDone={() => navigate(ROUTES.private.dashboard)}
              againLabel={t("New transfer")}
              onAgain={ft.newTransfer}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TransferPage;
