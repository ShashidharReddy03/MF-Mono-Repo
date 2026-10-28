import { useEffect } from "react";
import { createIdleTimer, getConfig, useLogout } from "@mf-bank/shared";
import { toast } from "@/shared/ui/base/BaseToast";

const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;

/** Logs the user out after N minutes without interaction (also across tab sleep) */
export const useInactivityLogout = () => {
  const logout = useLogout();

  useEffect(() => {
    const timer = createIdleTimer(getConfig().inactivityTimeoutMs, () => {
      void logout();
      toast.info("You were logged out after a period of inactivity.");
    });
    const onActivity = () => timer.reset();
    const onVisibility = () => {
      if (document.visibilityState === "visible") timer.checkElapsed();
    };

    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    timer.reset();

    return () => {
      timer.stop();
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [logout]);
};
