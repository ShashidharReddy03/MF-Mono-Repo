import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "@mf-bank/shared";
import { env } from "@/core/config/env";
import Logo from "@/shared/ui/components/Logo";
import BaseText from "@/shared/ui/base/BaseText";

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Logo />
      <BaseText weight="bold" className="mt-10 text-2xl">
        {t("Mobile Banking")}
      </BaseText>
      <BaseText className="mt-2 text-sm text-muted">
        React Native CLI shell — same shared package, NativeWind tokens, language and theme as the Expo app.
      </BaseText>
      <BaseText className="mt-6 text-xs text-muted">Mock API: {env.useMock ? "on" : "off"}</BaseText>
      <Pressable
        onPress={() => navigation.navigate("Preferences")}
        className="mt-8 items-center rounded-xl bg-primary py-3.5"
        accessibilityRole="button"
      >
        <BaseText weight="semibold" className="text-white">
          {t("Settings")}
        </BaseText>
      </Pressable>
    </View>
  );
};

export default WelcomeScreen;
