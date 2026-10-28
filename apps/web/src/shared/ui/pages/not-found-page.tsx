import { useNavigate } from "react-router-dom";
import BaseButton from "../base/BaseButton";
import { t } from "@mf-bank/shared";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-surface p-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary/15">404</p>
        <h1 className="mt-2 text-lg font-semibold text-primary">{t("This page doesn't exist")}</h1>
        <p className="mt-1 text-sm text-muted">{t("Check the address, or head back to safety.")}</p>
        <BaseButton type="primary" label={t("Go home")} className="mt-6" onClick={() => navigate("/", { replace: true })} />
      </div>
    </div>
  );
};

export default NotFoundPage;
