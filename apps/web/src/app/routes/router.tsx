import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import SuspenseLoader from "@/shared/ui/components/SuspenseLoader";
import PublicLayout from "@/modules/public/layout/PublicLayout";
import PrivateLayout from "@/modules/private/layout/PrivateLayout";
import NotFoundPage from "@/shared/ui/pages/not-found-page";
import RequireAuth from "./RequireAuth";
import RequireGuest from "./RequireGuest";
import { ROUTES } from "./routes";

// Code-split every page
const LoginPage = lazy(() => import("@/modules/public/login/login-page"));
const RegistrationPage = lazy(() => import("@/modules/public/registration/registration-page"));
const ForgotPasswordPage = lazy(() => import("@/modules/public/recovery/forgot-password-page"));
const ForgotUsernamePage = lazy(() => import("@/modules/public/recovery/forgot-username-page"));
const DashboardPage = lazy(() => import("@/modules/private/dashboard/dashboard-page"));
const StatementPage = lazy(() => import("@/modules/private/statement/statement-page"));
const BeneficiaryPage = lazy(() => import("@/modules/private/beneficiary/beneficiary-page"));
const AddBeneficiaryPage = lazy(() => import("@/modules/private/beneficiary/add-beneficiary-page"));
const SettingsPage = lazy(() => import("@/modules/private/settings/settings-page"));
const TransferPage = lazy(() => import("@/modules/private/transfer/transfer-page"));
const ProfilePage = lazy(() => import("@/modules/private/profile/profile-page"));
const PreferencesPage = lazy(() => import("@/modules/public/preferences/preferences-page"));

const page = (node: ReactNode) => <Suspense fallback={<SuspenseLoader />}>{node}</Suspense>;

export const router = createBrowserRouter(
  [
    { path: "/", element: <Navigate to={ROUTES.public.login} replace /> },
    {
      element: <RequireGuest />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            { path: ROUTES.public.login, element: page(<LoginPage />) },
            { path: ROUTES.public.registration, element: page(<RegistrationPage />) },
            { path: ROUTES.public.forgotPassword, element: page(<ForgotPasswordPage />) },
            { path: ROUTES.public.forgotUsername, element: page(<ForgotUsernamePage />) },
            { path: ROUTES.public.preferences, element: page(<PreferencesPage />) },
          ],
        },
      ],
    },
    {
      element: <RequireAuth />,
      children: [
        {
          element: <PrivateLayout />,
          children: [
            { path: ROUTES.private.dashboard, element: page(<DashboardPage />) },
            { path: ROUTES.private.statements, element: page(<StatementPage />) },
            { path: ROUTES.private.beneficiaries, element: page(<BeneficiaryPage />) },
            { path: ROUTES.private.addBeneficiary, element: page(<AddBeneficiaryPage />) },
            { path: ROUTES.private.settings, element: page(<SettingsPage />) },
            { path: ROUTES.private.transfer, element: page(<TransferPage />) },
            { path: ROUTES.private.profile, element: page(<ProfilePage />) },
          ],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
