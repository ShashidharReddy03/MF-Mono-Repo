import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { t } from "@mf-bank/shared";
import PreferencesPanel from "@/shared/ui/components/PreferencesPanel";
import { ROUTES } from "@/app/routes/routes";

/** Same preferences as the Settings page, reachable before login */
const PreferencesPage = () => (
  <div className="flex flex-col gap-6">
    <div>
      <Link to={ROUTES.public.login} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-dark">
        <ArrowLeftOutlined className="rtl:rotate-180" /> {t("Back to login")}
      </Link>
      <h2 className="text-xl font-bold text-primary">{t("Settings")}</h2>
      <p className="mt-1 text-sm text-muted">{t("Personalise how the app looks.")}</p>
    </div>
    <PreferencesPanel />
  </div>
);

export default PreferencesPage;
