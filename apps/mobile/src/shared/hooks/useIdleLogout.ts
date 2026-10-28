import { useEffect, useMemo, useRef } from "react";
import type { GestureResponderHandlers } from "react-native";
import { createIdleTimer, getConfig, selectIsAuthenticated, useAppSelector, useLogout, t } from "@mf-bank/shared";
import { toast } from "@/shared/ui/base/BaseToast";

/**
 * Inactivity logout for authenticated users. Returns responder props for the
 * root <View>: every touch anywhere resets the timer, but we never *claim*
 * the responder, so taps still reach buttons normally.
 */
export const useIdleLogout = (): Pick<GestureResponderHandlers, "onStartShouldSetResponderCapture"> => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const logout = useLogout();
  const timer = useRef<ReturnType<typeof createIdleTimer> | null>(null);

  useEffect(() => {
    if (!isAuth) return;
    timer.current = createIdleTimer(getConfig().inactivityTimeoutMs, () => {
      void logout();
      toast.info(t("You were logged out after a period of inactivity."));
    });
    timer.current.reset();
    return () => {
      timer.current?.stop();
      timer.current = null;
    };
  }, [isAuth, logout]);

  return useMemo(
    () => ({
      onStartShouldSetResponderCapture: () => {
        timer.current?.reset();
        return false;
      },
    }),
    [],
  );
};
