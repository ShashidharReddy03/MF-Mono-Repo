import type { ComponentType } from "react";
import { HomeOutlined, FileTextOutlined, TeamOutlined, SettingOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";
import { ROUTES } from "@/app/routes/routes";
import { t } from "@mf-bank/shared";

export type NavItem = { key: string; label: string; path: string; icon: ComponentType };

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", get label() { return t("Dashboard"); }, path: ROUTES.private.dashboard, icon: HomeOutlined },
  { key: "transfer", get label() { return t("Fund transfer"); }, path: ROUTES.private.transfer, icon: SwapOutlined },
  { key: "statements", get label() { return t("Statements"); }, path: ROUTES.private.statements, icon: FileTextOutlined },
  { key: "beneficiaries", get label() { return t("Beneficiaries"); }, path: ROUTES.private.beneficiaries, icon: TeamOutlined },
  { key: "profile", get label() { return t("My profile"); }, path: ROUTES.private.profile, icon: UserOutlined },
  { key: "settings", get label() { return t("Settings"); }, path: ROUTES.private.settings, icon: SettingOutlined },
];
