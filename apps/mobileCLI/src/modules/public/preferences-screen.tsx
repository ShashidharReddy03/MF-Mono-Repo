import { Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "@mf-bank/shared";
import PreferencesPanel from "@/shared/ui/components/PreferencesPanel";
import BaseText from "@/shared/ui/base/BaseText";

const PreferencesScreen = () => {
  const navigation = useNavigation();
  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center px-4 pb-3 pt-14">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button">
          <BaseText weight="semibold" className="text-primary">
            ← {t("Cancel")}
          </BaseText>
        </Pressable>
        <BaseText weight="bold" className="ms-4 text-lg">
          {t("Settings")}
        </BaseText>
      </View>
      <ScrollView className="flex-1 px-5 pb-8" contentContainerClassName="pb-10">
        <BaseText className="mb-6 text-sm text-muted">{t("Personalise how the app looks.")}</BaseText>
        <PreferencesPanel />
      </ScrollView>
    </View>
  );
};

export default PreferencesScreen;
