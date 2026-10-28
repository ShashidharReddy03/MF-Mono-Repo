import { useEffect } from "react";
import { resetRegistration, useAppDispatch, useRegistration, t } from "@mf-bank/shared";
import Stepper from "@/shared/ui/components/Stepper";
import RCustomerVerification from "./components/R-CustomerVerification";
import ROTP from "./components/R-OTP";
import RSecurityQuestions from "./components/R-SecurityQuestions";
import RCredentials from "./components/R-Credentials";
import RSuccess from "./components/R-Success";

const STEP_COMPONENTS = [RCustomerVerification, ROTP, RSecurityQuestions, RCredentials, RSuccess];

const RegistrationPage = () => {
  const dispatch = useAppDispatch();
  const { step, steps } = useRegistration();

  // always start clean (direct URL visits, refresh, back navigation)
  useEffect(() => {
    dispatch(resetRegistration());
  }, [dispatch]);

  const Active = STEP_COMPONENTS[step];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-primary">{t("Register for Internet Banking")}</h2>
        <p className="mt-1 text-sm text-muted">{t("It takes about two minutes. Keep your phone nearby for the OTP.")}</p>
      </div>
      <Stepper steps={steps} current={step} />
      <Active />
    </div>
  );
};

export default RegistrationPage;
