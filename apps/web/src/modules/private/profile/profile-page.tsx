import { useState } from "react";
import { PROFILE_SECTIONS, t, type ProfileSection } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import PPersonalInfo from "./components/P-PersonalInfo";
import PChangePassword from "./components/P-ChangePassword";
import PChangeLimits from "./components/P-ChangeLimits";
import PSecurityQuestions from "./components/P-SecurityQuestions";

/** My Profile — each section's logic is a shared hook (useProfile.ts), same as mobile */
const ProfilePage = () => {
  const [section, setSection] = useState<ProfileSection>("info");
  return (
    <>
      <PageHeader title={t("My profile")} description={t("Your details, password, transfer limit and security questions.")} />
      <div className="rounded-2xl border border-primary/10 bg-white p-5 sm:p-6">
        <div className="mb-6 overflow-x-auto">
          <BaseSegmented<ProfileSection> value={section} onChange={setSection} options={PROFILE_SECTIONS.map((s) => ({ label: s.label, value: s.key }))} />
        </div>
        {section === "info" && <PPersonalInfo />}
        {section === "password" && <PChangePassword />}
        {section === "limits" && <PChangeLimits />}
        {section === "security" && <PSecurityQuestions />}
      </div>
    </>
  );
};

export default ProfilePage;
