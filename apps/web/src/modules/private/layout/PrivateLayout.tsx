import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Drawer, Dropdown, Modal } from "antd";
import { LogoutOutlined, MenuOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { initials, isRTL, useAppSelector, useLogout, useSessionLimit, t } from "@mf-bank/shared";
import LanguageSwitch from "@/shared/ui/components/LanguageSwitch";
import Logo from "@/shared/ui/components/Logo";
import { NAV_ITEMS } from "@/core/config/navConfig";
import { useInactivityLogout } from "@/shared/hooks/useInactivityLogout";
import { useBackForwardGuard } from "@/shared/hooks/useBackForwardGuard";

/** Sidebar links; `onNavigate` closes the mobile drawer */
const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ key, label, path, icon: Icon }) => {
        const active = pathname === path || pathname.startsWith(`${path}/`);
        return (
          <NavLink
            key={key}
            to={path}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={active ? "text-secondary" : ""}>
              <Icon />
            </span>
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
};

/**
 * Authenticated shell. Mounting it switches on the session protections:
 * inactivity logout and the browser back/forward guard.
 */
const PrivateLayout = () => {
  useInactivityLogout();
  useSessionLimit(); // absolute session limit (shared with mobile)
  useBackForwardGuard();

  const logout = useLogout();
  const meta = useAppSelector((s) => s.auth.meta);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const confirmLogout = () =>
    Modal.confirm({
      title: t("Log out?"),
      content: t("You will need to sign in again to access your accounts."),
      okText: t("Log out"),
      cancelText: t("Cancel"),
      centered: true,
      onOk: () => logout(),
    });

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col bg-primary p-5">
      <div className="mb-8 px-1">
        <Logo light />
      </div>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto">
        <button
          type="button"
          onClick={confirmLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white"
        >
          <LogoutOutlined /> {t("Log out")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar()}</aside>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement={isRTL() ? "right" : "left"}
        size={264}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {sidebar(() => setDrawerOpen(false))}
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-primary/10 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={t("Open menu")}
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-primary hover:bg-surface lg:hidden"
            >
              <MenuOutlined />
            </button>
            <div className="lg:hidden">
              <Logo compact />
            </div>
            {meta?.LastLogin && (
              <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                <ClockCircleOutlined /> {t("Last login")}: <span dir="ltr">{meta.LastLogin}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
          <LanguageSwitch />
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "info",
                  disabled: true,
                  label: (
                    <div className="py-1">
                      <div className="font-semibold text-primary">{meta?.CNAME}</div>
                      <div className="text-xs text-muted">CIF <span dir="ltr">{meta?.CIF}</span></div>
                    </div>
                  ),
                },
                { type: "divider" },
                { key: "logout", icon: <LogoutOutlined />, get label() { return t("Log out"); }, onClick: confirmLogout },
              ],
            }}
          >
            <button type="button" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary-light text-sm font-bold text-secondary-dark">
                {initials(meta?.CNAME)}
              </span>
              <span className="hidden text-sm font-medium text-primary sm:block">{meta?.CNAME}</span>
            </button>
          </Dropdown>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
