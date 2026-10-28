import { Link, Outlet } from "react-router-dom";
import { LockOutlined, SafetyCertificateOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { ROUTES } from "@/app/routes/routes";
import LanguageSwitch from "@/shared/ui/components/LanguageSwitch";
import Logo from "@/shared/ui/components/Logo";
import { t } from "@mf-bank/shared";

const REMINDERS = [
  { icon: LockOutlined, get text() { return t("We will never ask for your password or OTP by phone, SMS or email."); } },
  { icon: SafetyCertificateOutlined, get text() { return t("Check the address bar shows our official domain before you sign in."); } },
  { icon: LogoutOutlined, get text() { return t("Log out when you're done, especially on a shared computer."); } },
];

/** Split screen: brand + security reminders on the left, the form on the right */
const PublicLayout = () => (
  <div className="grid min-h-screen lg:grid-cols-[minmax(360px,5fr)_7fr]">
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex">
      <Logo light />
      <div className="max-w-sm">
        <h1 className="text-3xl font-bold leading-tight">{t("Your accounts, statements and payees in one secure place.")}</h1>
        <ul className="mt-10 space-y-5">
          {REMINDERS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-sm text-white/75">
              <Icon className="mt-0.5 text-secondary" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-white/40">
        © {new Date().getFullYear()} MF Bank. {t("Licensed by the Central Bank.")}
      </p>
    </aside>

    <main className="relative flex flex-col items-center justify-center px-4 py-8 sm:px-8">
      <div className="absolute end-4 top-4 flex items-center gap-1">
        <LanguageSwitch />
        <Link
          to={ROUTES.public.preferences}
          aria-label={t("Settings")}
          title={t("Settings")}
          className="grid h-9 w-9 place-items-center rounded-lg text-primary hover:bg-surface"
        >
          <SettingOutlined />
        </Link>
      </div>
      <div className="mb-6 lg:hidden">
        <Logo />
      </div>
      <div className="w-full max-w-[520px] rounded-2xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8">
        <Outlet />
      </div>
    </main>
  </div>
);

export default PublicLayout;
