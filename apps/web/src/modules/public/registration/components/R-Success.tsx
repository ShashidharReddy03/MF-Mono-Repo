import { useNavigate } from "react-router-dom";
import { useRegistration, t } from "@mf-bank/shared";
import { ROUTES } from "@/app/routes/routes";
import ResultPanel from "@/shared/ui/components/ResultPanel";

const RSuccess = () => {
  const navigate = useNavigate();
  const { success, reset } = useRegistration();

  return (
    <ResultPanel
      title={success?.finalScreenHeader ?? "You're registered"}
      message={success?.finalScreenMsg}
      details={success?.Details}
      actionLabel={t("Go to login")}
      onAction={() => {
        reset();
        navigate(ROUTES.public.login, { replace: true });
      }}
    />
  );
};

export default RSuccess;
