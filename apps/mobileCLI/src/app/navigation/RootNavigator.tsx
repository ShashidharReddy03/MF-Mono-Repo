import { useRef } from "react";
import { NavigationContainer, DefaultTheme, type NavigationState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "@mf-bank/shared";
import { useTheme } from "@/core/i18n/theme";
import WelcomeScreen from "@/modules/public/welcome-screen";
import PreferencesScreen from "@/modules/public/preferences-screen";
import { navigationRef } from "./navigationRef";
import type { PublicStackParamList } from "./types";

const Stack = createNativeStackNavigator<PublicStackParamList>();

const RootNavigator = () => {
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
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
