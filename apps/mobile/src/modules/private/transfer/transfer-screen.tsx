import { useNavigation } from "@react-navigation/native";
import { t, TRANSFER_KIND_LABEL, useFundTransfer, type TransferKind } from "@mf-bank/shared";
import Screen from "@/shared/ui/components/Screen";
import Stepper from "@/shared/ui/components/Stepper";
import AuthorisedActionPanel from "@/shared/ui/components/AuthorisedActionPanel";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseCard from "@/shared/ui/base/BaseCard";
import TOwnForm from "./components/T-OwnForm";
import TSameBankForm from "./components/T-SameBankForm";
import TOtherBankForm from "./components/T-OtherBankForm";

const STEP_INDEX = { idle: 0, confirm: 1, otp: 1, result: 2 } as const;

/** Fund transfer tab — same shared useFundTransfer hook as the web page */
const TransferScreen = () => {
  const navigation = useNavigation();
  const ft = useFundTransfer();
  const { step } = ft.action;

  return (
    <Screen edges={[]}>
      <Stepper steps={[t("Details"), t("Confirm"), t("Done")]} current={STEP_INDEX[step]} />
      {step === "idle" && (
        <BaseSegmented<TransferKind>
          value={ft.kind}
          onChange={ft.setKind}
          size="small"
          options={ft.kinds.map((k) => ({ label: TRANSFER_KIND_LABEL[k], value: k }))}
        />
      )}
      <BaseCard className="mt-4 p-5">
        {step === "idle" ? (
          <>
            {ft.kind === "OWN" && <TOwnForm key="own" ft={ft} />}
            {ft.kind === "SCU" && <TSameBankForm key="scu" ft={ft} />}
            {ft.kind === "LOCAL" && <TOtherBankForm key="local" ft={ft} />}
          </>
        ) : (
          <AuthorisedActionPanel
            action={ft.action}
            submitLabel={t("Confirm transfer")}
            doneLabel={t("Go to dashboard")}
            onDone={() => {
              ft.newTransfer();
              navigation.navigate("Tabs", { screen: "Dashboard" });
            }}
            againLabel={t("New transfer")}
            onAgain={ft.newTransfer}
          />
        )}
      </BaseCard>
    </Screen>
  );
};

export default TransferScreen;
