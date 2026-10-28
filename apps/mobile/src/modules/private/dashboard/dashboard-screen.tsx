import { ActivityIndicator, FlatList, Pressable, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, initials, useDashboard, type MiniFilter, t } from "@mf-bank/shared";
import Screen from "@/shared/ui/components/Screen";
import BaseText from "@/shared/ui/base/BaseText";
import BaseCard from "@/shared/ui/base/BaseCard";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import TransactionRows from "@/shared/ui/components/TransactionRows";
import { useConfirmLogout } from "@/shared/hooks/useConfirmLogout";
import DAccountCard from "./components/D-AccountCard";
import DQuickActions from "./components/D-QuickActions";

const FILTERS: { label: string; value: MiniFilter }[] = [
  { get label() { return t("All"); }, value: "ALL" },
  { get label() { return t("Credits"); }, value: "CREDIT" },
  { get label() { return t("Debits"); }, value: "DEBIT" },
];

/** Same shared useDashboard hook as the web dashboard-page */
const DashboardScreen = () => {
  const d = useDashboard();
  const navigation = useNavigation();
  const confirmLogout = useConfirmLogout();
  const { width } = useWindowDimensions();
  const cardWidth = width - 40 - (d.accounts.length > 1 ? 32 : 0);
  const firstName = d.meta?.CNAME?.split(" ")[0] ?? "";

  return (
    <Screen onRefresh={d.reloadMini} refreshing={false}>
      {/* header */}
      <View className="mb-5 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary-light">
          <BaseText weight="bold" className="text-secondary-dark">
            {initials(d.meta?.CNAME)}
          </BaseText>
        </View>
        <View className="flex-1">
          <BaseText className="text-xs text-muted">{d.greeting}{t(",")}</BaseText>
          <BaseText weight="bold" className="text-lg">
            {firstName}
          </BaseText>
        </View>
        <Pressable onPress={() => confirmLogout()} hitSlop={10} accessibilityLabel={t("Log out")} className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="log-out-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>
      {d.meta?.LastLogin && (
        <View className="mb-4 flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={13} color={colors.muted} />
          <BaseText className="text-xs text-muted">{t("Last login")}: {"\u200E"}{d.meta.LastLogin}</BaseText>
        </View>
      )}

      {/* accounts carousel */}
      <FlatList
        horizontal
        data={d.accounts}
        keyExtractor={(a) => a.accountNumber}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 12 }}
        className="-mx-5 mb-5 grow-0"
        contentContainerClassName="px-5"
        renderItem={({ item: a }) => (
          <DAccountCard
            account={a}
            width={cardWidth}
            balance={d.balances[a.accountNumber]}
            visible={!!d.visible[a.accountNumber]}
            loading={d.balanceLoading === a.accountNumber}
            selected={d.accounts.length > 1 && d.selectedAccount === a.accountNumber}
            onSelect={() => d.setSelectedAccount(a.accountNumber)}
            onToggle={() => void d.toggleBalance(a.accountNumber)}
          />
        )}
      />

      <DQuickActions account={d.selectedAccount} />

      {/* recent transactions */}
      <BaseCard className="mt-5">
        <View className="mb-3 flex-row items-center justify-between">
          <BaseText weight="bold" className="text-base">
            {t("Recent transactions")}
          </BaseText>
          <Pressable
            onPress={() => navigation.navigate("Tabs", { screen: "Statements", params: { account: d.selectedAccount } })}
            hitSlop={8}
          >
            <BaseText weight="semibold" className="text-xs text-secondary">
              {t("See all")}
            </BaseText>
          </Pressable>
        </View>
        <BaseSegmented value={d.filter} onChange={d.setFilter} options={FILTERS} size="small" />
        <View className="mt-2">
          {d.miniLoading ? (
            <ActivityIndicator className="py-10" color={colors.secondary} />
          ) : d.transactions.length ? (
            <TransactionRows rows={d.transactions} currency={d.currency} />
          ) : (
            <BaseEmpty title={t("No transactions to show")} />
          )}
        </View>
      </BaseCard>
    </Screen>
  );
};

export default DashboardScreen;
