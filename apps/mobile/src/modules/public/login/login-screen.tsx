import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getLoginConfig, t } from "@mf-bank/shared";
import BaseText from "@/shared/ui/base/BaseText";
import MpinLogin from "./components/MpinLogin";
import PasswordLogin from "./components/PasswordLogin";

/**
 * Mobile login page. Which form shows is decided in ONE place:
 * packages/shared/src/config/login.config.ts → LOGIN_CONFIG.mobile.method
 *   "mpin"     → username + MPIN (current setting)
 *   "password" → username + password + captcha + OTP (same as web)
 * After sign-in the store becomes authenticated and RootNavigator swaps to the
 * private area — no navigation call needed here.
 */
const LoginScreen = () => {
  const navigation = useNavigation();

  const footer = (
    <View className="mt-6 flex-row justify-center gap-1">
      <BaseText className="text-sm text-muted">{t("New to MF Bank online?")}</BaseText>
      <Pressable onPress={() => navigation.navigate("Registration")} hitSlop={8}>
        <BaseText weight="semibold" className="text-sm text-secondary">
          {t("Register")}
        </BaseText>
      </Pressable>
    </View>
  );

  return getLoginConfig().method === "mpin" ? <MpinLogin footer={footer} /> : <PasswordLogin footer={footer} />;
};

export default LoginScreen;
