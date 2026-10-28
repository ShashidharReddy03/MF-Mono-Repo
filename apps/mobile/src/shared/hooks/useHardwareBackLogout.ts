import { useEffect } from "react";
import { BackHandler } from "react-native";
import { navigationRef } from "@/app/navigation/navigationRef";
import { t } from "@mf-bank/shared";
import { useConfirmLogout } from "./useConfirmLogout";

/**
 * Android back button inside the private area. If React Navigation can go
 * back (a pushed screen, or a non-first tab) we let it. Only at the root do
 * we step in: ask to log out instead of silently leaving the app with a live
 * session — the mobile twin of the web back/forward guard.
 */
export const useHardwareBackLogout = () => {
  const confirmLogout = useConfirmLogout();
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (navigationRef.isReady() && navigationRef.canGoBack()) return false;
      confirmLogout(t("Going back will end your secure session."));
      return true;
    });
    return () => sub.remove();
  }, [confirmLogout]);
};
