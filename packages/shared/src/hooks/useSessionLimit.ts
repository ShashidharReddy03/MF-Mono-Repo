import { useEffect } from "react";
import { getConfig } from "../config/platform";
import { t } from "../i18n";
import { selectIsAuthenticated } from "../store/store";
import { useAppSelector } from "./hooks";
import { useLogout } from "./useLogout";

/**
 * Absolute session limit (web + mobile): the session ends after
 * absoluteSessionMs even if the customer is active the whole time.
 * Complements the inactivity timeout and the server's own session expiry.
 */
export const useSessionLimit = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const logout = useLogout();

  useEffect(() => {
    const { absoluteSessionMs, toast } = getConfig();
    if (!isAuth || !absoluteSessionMs) return;
    const timer = setTimeout(() => {
      void logout();
      (toast.info ?? toast.error)(t("For your security, your session has ended. Please sign in again."));
    }, absoluteSessionMs);
    return () => clearTimeout(timer);
  }, [isAuth, logout]);
};
