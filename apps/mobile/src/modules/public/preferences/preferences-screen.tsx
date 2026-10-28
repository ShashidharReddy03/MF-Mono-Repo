import { useNavigation } from "@react-navigation/native";
import { t } from "@mf-bank/shared";
import PublicShell from "@/shared/ui/components/PublicShell";
import PreferencesPanel from "@/shared/ui/components/PreferencesPanel";

/** Same settings, reachable before login from the gear on the pre-login screens */
const PreferencesScreen = () => {
  const navigation = useNavigation();
  return (
    <PublicShell title={t("Settings")} subtitle={t("Personalise how the app looks.")} onBack={() => navigation.goBack()} hideSettings>
      <PreferencesPanel />
    </PublicShell>
  );
};

export default PreferencesScreen;
