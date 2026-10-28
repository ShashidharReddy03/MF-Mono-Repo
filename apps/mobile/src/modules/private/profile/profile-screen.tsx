import { ActivityIndicator, I18nManager, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, initials, maskAccount, PROFILE_SECTIONS, t, useProfile } from "@mf-bank/shared";
import Screen from "@/shared/ui/components/Screen";
import DetailsList from "@/shared/ui/components/DetailsList";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseText from "@/shared/ui/base/BaseText";
import type { PrivateStackParamList } from "@/app/navigation/types";

const ROUTE: Record<"password" | "limits" | "security", keyof PrivateStackParamList> = {
  password: "ChangePassword",
  limits: "ChangeLimits",
  security: "SecurityQuestions",
};
const ICON = { password: "key-outline", limits: "speedometer-outline", security: "shield-checkmark-outline" } as const;

/** My Profile — personal info + linked accounts; each change opens its own screen */
const ProfileScreen = () => {
  const navigation = useNavigation();
  const p = useProfile();

  return (
    <Screen edges={["bottom"]}>
      <View className="mb-5 items-center gap-2">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary-light">
          <BaseText weight="bold" className="text-2xl text-secondary-dark">
            {initials(p.name)}
          </BaseText>
        </View>
        <BaseText weight="bold" className="text-lg">
          {p.name}
        </BaseText>
      </View>

      <DetailsList items={p.details} />

      <BaseCard className="mt-5 p-0">
        {PROFILE_SECTIONS.filter((s) => s.key !== "info").map((s, i) => {
          const key = s.key as keyof typeof ROUTE;
          return (
            <Pressable
              key={s.key}
              onPress={() => navigation.navigate(ROUTE[key] as never)}
              accessibilityRole="button"
              className={`flex-row items-center gap-3 px-4 py-4 ${i ? "border-t border-primary/5" : ""}`}
            >
              <Ionicons name={ICON[key]} size={20} color={colors.primary} />
              <BaseText weight="semibold" className="flex-1 text-[15px]">
                {s.label}
              </BaseText>
              <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.muted} />
            </Pressable>
          );
        })}
      </BaseCard>

      <BaseText weight="bold" className="mb-2 mt-6 text-base">
        {t("Linked accounts")}
      </BaseText>
      {p.loading && !p.accounts.length ? (
        <ActivityIndicator color={colors.secondary} className="py-6" />
      ) : (
        <BaseCard className="p-0">
          {p.accounts.map((a, i) => (
            <View key={a.accountNumber} className={`flex-row items-center justify-between gap-3 px-4 py-3 ${i ? "border-t border-primary/5" : ""}`}>
              <View className="flex-1">
                <BaseText weight="semibold" className="text-sm">
                  {a.accountName}
                </BaseText>
                <BaseText className="text-xs text-muted">
                  {a.accountType} · {a.currency} · {"‎"}
                  {maskAccount(a.accountNumber)}
                </BaseText>
              </View>
              <View className="rounded-full bg-secondary-light px-2.5 py-1">
                <BaseText weight="semibold" className="text-2xs text-secondary-dark">
                  {a.status}
                </BaseText>
              </View>
            </View>
          ))}
        </BaseCard>
      )}
    </Screen>
  );
};

export default ProfileScreen;
