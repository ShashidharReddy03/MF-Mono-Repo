import { t } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import PreferencesPanel from "@/shared/ui/components/PreferencesPanel";

const SettingsPage = () => (
  <>
    <PageHeader title={t("Settings")} description={t("Personalise how the app looks.")} />
    <div className="max-w-3xl rounded-2xl border border-primary/10 bg-white p-5 sm:p-6">
      <PreferencesPanel />
    </div>
  </>
);

export default SettingsPage;
