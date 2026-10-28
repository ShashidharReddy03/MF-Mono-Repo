import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "@/modules/public/login/login-screen";
import RegistrationScreen from "@/modules/public/registration/registration-screen";
import ForgotPasswordScreen from "@/modules/public/recovery/forgot-password-screen";
import ForgotUsernameScreen from "@/modules/public/recovery/forgot-username-screen";
import PreferencesScreen from "@/modules/public/preferences/preferences-screen";
import type { PublicStackParamList } from "./types";

const Stack = createNativeStackNavigator<PublicStackParamList>();

/** Pre-login screens (web: RequireGuest + PublicLayout) */
const PublicNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Registration" component={RegistrationScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ForgotUsername" component={ForgotUsernameScreen} />
    <Stack.Screen name="Preferences" component={PreferencesScreen} />
  </Stack.Navigator>
);

export default PublicNavigator;
