import { useRef } from "react";
import { NavigationContainer, DefaultTheme, type NavigationState } from "@react-navigation/native";
import { colors, selectIsAuthenticated, useAppSelector } from "@mf-bank/shared";
import { useTheme } from "@/core/i18n/theme";
import PublicNavigator from "./PublicNavigator";
import PrivateNavigator from "./PrivateNavigator";
import { navigationRef } from "./navigationRef";

/**
 * Auth gate: which navigator is mounted depends only on the in-memory
 * session. Logout, idle timeout, background timeout and server session
 * expiry (statuscodep 98) all just wipe the store — and the whole private
 * tree (with its screen state) is unmounted automatically.
 *
 * Theme switch: the container is re-mounted (key) so every screen picks up the
 * new colours, and restored from the last navigation state, so the user stays
 * on the same screen and stays logged in.
 */
const RootNavigator = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const theme = useTheme();
  const navState = useRef<NavigationState | undefined>(undefined);

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: colors.secondary, background: colors.surface, text: colors.primary },
  };

  return (
    <NavigationContainer
      key={theme}
      ref={navigationRef}
      theme={navTheme}
      initialState={navState.current}
      onStateChange={(s) => {
        navState.current = s;
      }}
    >
      {isAuth ? <PrivateNavigator /> : <PublicNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
