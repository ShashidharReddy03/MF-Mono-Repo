import { StatusBar, View } from "react-native";
import { vars } from "nativewind";
import { Provider as ReduxProvider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { store, themeCssVars } from "@mf-bank/shared";
import { loadSavedLanguage } from "@/core/i18n/language";
import { loadSavedTheme, useTheme } from "@/core/i18n/theme";
import RootNavigator from "./navigation/RootNavigator";

const App = () => {
  const [languageReady, setLanguageReady] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    void loadSavedTheme()
      .then(loadSavedLanguage)
      .then((ready) => ready && setLanguageReady(true));
  }, []);

  if (!languageReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <View style={[{ flex: 1 }, vars(themeCssVars(theme))]}>
            <StatusBar barStyle="dark-content" />
            <RootNavigator />
          </View>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};

export default App;
