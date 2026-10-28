import { View } from "react-native";
import { vars } from "nativewind";
import { Provider as ReduxProvider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { store, themeCssVars, useSessionLimit } from "@mf-bank/shared";
import { FONT_ASSETS } from "@/core/config/fonts";
import { loadSavedLanguage } from "@/core/i18n/language";
import { loadSavedTheme, useTheme } from "@/core/i18n/theme";
import { useAppSecurity } from "@/shared/hooks/useAppSecurity";
import { useIdleLogout } from "@/shared/hooks/useIdleLogout";
import { useDeviceSecurity } from "@/shared/hooks/useDeviceSecurity";
import GlobalLoader from "@/shared/ui/components/GlobalLoader";
import PrivacyOverlay from "@/shared/ui/components/PrivacyOverlay";
import DeviceSecurityBlock from "@/shared/ui/components/DeviceSecurityBlock";
import ThemeProvider from "./providers/ThemeProvider";
import RootNavigator from "./navigation/RootNavigator";

void SplashScreen.preventAutoHideAsync();

/** Needs the Redux store, so it lives inside <ReduxProvider> */
const SecureShell = () => {
  const { privacyVisible } = useAppSecurity();
  const idleResponder = useIdleLogout();
  const device = useDeviceSecurity();
  useSessionLimit(); // absolute session limit (shared)
  return (
    <View className="flex-1" {...idleResponder}>
      <RootNavigator />
      <GlobalLoader />
      <PrivacyOverlay visible={privacyVisible} />
      <DeviceSecurityBlock findings={device.blocking} isolated={device.isolated} updateUrl={device.updateUrl} onRetry={() => void device.recheck()} />
    </View>
  );
};

const App = () => {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const [languageReady, setLanguageReady] = useState(false);
  const theme = useTheme();

  // Saved theme, then saved language (+ RTL layout). The language step returns
  // false when it restarts the app to flip layout direction.
  useEffect(() => {
    void loadSavedTheme()
      .then(loadSavedLanguage)
      .then((ready) => ready && setLanguageReady(true));
  }, []);

  const ready = (fontsLoaded || !!fontError) && languageReady;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          {/* Theme colours as CSS variables for every NativeWind class below (incl. modals) */}
          <View style={[{ flex: 1 }, vars(themeCssVars(theme))]}>
            <ThemeProvider theme={theme}>
              <StatusBar style="dark" />
              <SecureShell />
            </ThemeProvider>
          </View>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

export default App;
