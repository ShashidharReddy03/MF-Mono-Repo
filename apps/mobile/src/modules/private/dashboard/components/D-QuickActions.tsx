import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, t } from "@mf-bank/shared";
import BaseText from "@/shared/ui/base/BaseText";

/** Same three shortcuts as the web dashboard */
const DQuickActions = ({ account }: { account: string }) => {
  const navigation = useNavigation();
  const actions = [
    { get label() { return t("Statement"); }, icon: "document-text-outline" as const, onPress: () => navigation.navigate("Tabs", { screen: "Statements", params: { account } }) },
    { get label() { return t("Add payee"); }, icon: "person-add-outline" as const, onPress: () => navigation.navigate("AddBeneficiary") },
    { get label() { return t("Payees"); }, icon: "people-outline" as const, onPress: () => navigation.navigate("Tabs", { screen: "Beneficiaries" }) },
  ];
  return (
    <View className="flex-row gap-3">
      {actions.map((a) => (
        <Pressable key={a.label} onPress={a.onPress} className="flex-1 items-center gap-2 rounded-2xl border border-primary/10 bg-white py-4">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary-light">
            <Ionicons name={a.icon} size={20} color={colors.secondaryDark} />
          </View>
          <BaseText weight="semibold" className="text-xs">
            {a.label}
          </BaseText>
        </Pressable>
      ))}
    </View>
  );
};

export default DQuickActions;
