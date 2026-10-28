import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, t } from "@mf-bank/shared";
import { FONTS } from "@/core/config/fonts";
import { useHardwareBackLogout } from "@/shared/hooks/useHardwareBackLogout";
import { useConfirmLogout } from "@/shared/hooks/useConfirmLogout";
import DashboardScreen from "@/modules/private/dashboard/dashboard-screen";
import StatementScreen from "@/modules/private/statement/statement-screen";
import BeneficiaryScreen from "@/modules/private/beneficiary/beneficiary-screen";
import AddBeneficiaryScreen from "@/modules/private/beneficiary/add-beneficiary-screen";
import SettingsScreen from "@/modules/private/settings/settings-screen";
import TransferScreen from "@/modules/private/transfer/transfer-screen";
import ProfileScreen from "@/modules/private/profile/profile-screen";
import ChangePasswordScreen from "@/modules/private/profile/change-password-screen";
import ChangeLimitsScreen from "@/modules/private/profile/change-limits-screen";
import SecurityQuestionsScreen from "@/modules/private/profile/security-questions-screen";
import type { PrivateStackParamList, PrivateTabParamList } from "./types";

const Tab = createBottomTabNavigator<PrivateTabParamList>();
const Stack = createNativeStackNavigator<PrivateStackParamList>();

const TAB_ICONS: Record<keyof PrivateTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Dashboard: ["home", "home-outline"],
  Transfer: ["swap-horizontal", "swap-horizontal-outline"],
  Statements: ["document-text", "document-text-outline"],
  Beneficiaries: ["people", "people-outline"],
  Settings: ["settings", "settings-outline"],
};

const LogoutButton = () => {
  const confirmLogout = useConfirmLogout();
  return (
    <Pressable onPress={() => confirmLogout()} hitSlop={10} className="me-4" accessibilityLabel={t("Log out")}>
      <Ionicons name="log-out-outline" size={24} color={colors.primary} />
    </Pressable>
  );
};

/** Same three sections as the web sidebar (NAV_ITEMS) */
const Tabs = () => (
  <Tab.Navigator
    backBehavior="firstRoute"
    screenOptions={({ route }) => ({
      headerTitleStyle: { fontFamily: FONTS.bold, color: colors.primary },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.surface },
      headerRight: () => <LogoutButton />,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontFamily: FONTS.semibold, fontSize: 11 },
      tabBarIcon: ({ focused, color, size }) => (
        <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t("Home"), headerShown: false }} />
    <Tab.Screen name="Transfer" component={TransferScreen} options={{ title: t("Transfer") }} />
    <Tab.Screen name="Statements" component={StatementScreen} options={{ title: t("Statements") }} />
    <Tab.Screen name="Beneficiaries" component={BeneficiaryScreen} options={{ title: t("Beneficiaries") }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t("Settings") }} />
  </Tab.Navigator>
);

/** Post-login area (web: RequireAuth + PrivateLayout) */
const PrivateNavigator = () => {
  useHardwareBackLogout();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontFamily: FONTS.bold, color: colors.primary },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddBeneficiary" component={AddBeneficiaryScreen} options={{ title: t("Add beneficiary") }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: t("My profile") }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: t("Change password") }} />
      <Stack.Screen name="ChangeLimits" component={ChangeLimitsScreen} options={{ title: t("Transfer limit") }} />
      <Stack.Screen name="SecurityQuestions" component={SecurityQuestionsScreen} options={{ title: t("Security questions") }} />
    </Stack.Navigator>
  );
};

export default PrivateNavigator;
