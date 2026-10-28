/** Single source of truth for URLs */
export const ROUTES = {
  public: {
    login: "/login",
    registration: "/register",
    forgotPassword: "/forgot-password",
    forgotUsername: "/forgot-username",
    preferences: "/preferences",
  },
  private: {
    dashboard: "/dashboard",
    statements: "/statements",
    beneficiaries: "/beneficiaries",
    addBeneficiary: "/beneficiaries/add",
    settings: "/settings",
    transfer: "/transfer",
    profile: "/profile",
  },
} as const;
