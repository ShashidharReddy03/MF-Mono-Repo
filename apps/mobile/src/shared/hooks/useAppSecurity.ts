import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as ScreenCapture from "expo-screen-capture";
import { getConfig, selectIsAuthenticated, useAppSelector, useLogout, t } from "@mf-bank/shared";
import { toast } from "@/shared/ui/base/BaseToast";

/**
 * Mobile equivalent of the demo's browser protections:
 *  - screenshots / screen recording blocked (Android FLAG_SECURE, iOS blanks recordings)
 *  - privacy overlay while the app is not in the foreground (task-switcher snapshot)
 *  - background timeout: returning after > idle timeout ends the session
 *    (the web version uses visibilitychange for the same thing)
 */
export const useAppSecurity = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const logout = useLogout();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    if (__DEV__) return; // keep screenshots possible while developing
    void ScreenCapture.preventScreenCaptureAsync();
    return () => {
      void ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === "active") {
        setPrivacyVisible(false);
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (isAuth && since && Date.now() - since > getConfig().inactivityTimeoutMs) {
          void logout();
          toast.info(t("You were logged out while the app was in the background."));
        }
      } else {
        // "inactive" fires on iOS just before the snapshot is taken
        setPrivacyVisible(true);
        backgroundedAt.current ??= Date.now();
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [isAuth, logout]);

  return { privacyVisible };
};
