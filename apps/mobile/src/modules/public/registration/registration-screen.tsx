import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useRegistration, t } from "@mf-bank/shared";
import PublicShell from "@/shared/ui/components/PublicShell";
import Stepper from "@/shared/ui/components/Stepper";
import ResultPanel from "@/shared/ui/components/ResultPanel";
import BaseCard from "@/shared/ui/base/BaseCard";
import RCustomerVerification from "./components/R-CustomerVerification";
import ROTP from "./components/R-OTP";
import RSecurityQuestions from "./components/R-SecurityQuestions";
import RCredentials from "./components/R-Credentials";

/** Wizard state lives in the shared registration slice (same as web) */
const RegistrationScreen = () => {
  const navigation = useNavigation();
  const reg = useRegistration();
  const { reset } = reg;

  // fresh wizard on open, nothing left behind on close
  useEffect(() => {
    reset();
    return reset;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toLogin = () => navigation.navigate("Login");

  const renderStep = () => {
    switch (reg.step) {
      case 0:
        return <RCustomerVerification onCancel={toLogin} />;
      case 1:
        return <ROTP />;
      case 2:
        return <RSecurityQuestions />;
      case 3:
        return <RCredentials />;
      default:
        return (
          <ResultPanel
            title={reg.success?.finalScreenHeader ?? t("Registration complete")}
            message={reg.success?.finalScreenMsg}
            details={reg.success?.Details}
            actionLabel={t("Go to login")}
            onAction={toLogin}
          />
        );
    }
  };

  return (
    <PublicShell title={t("Register for mobile banking")} subtitle="It takes about two minutes." onBack={toLogin}>
      <Stepper steps={reg.steps} current={reg.step} />
      <BaseCard className="p-5">{renderStep()}</BaseCard>
    </PublicShell>
  );
};

export default RegistrationScreen;
