import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, formatAmount, maskAccount, type Account, type Balance, t } from "@mf-bank/shared";
import BaseText from "@/shared/ui/base/BaseText";

type Props = {
  account: Account;
  balance?: Balance;
  visible: boolean;
  loading: boolean;
  selected: boolean;
  width: number;
  onSelect: () => void;
  onToggle: () => void;
};

/** Navy card with arc pattern (same decorative element as web). Balance hidden until tapped. */
const DAccountCard = ({ account, balance, visible, loading, selected, width, onSelect, onToggle }: Props) => (
  <Pressable
    onPress={onSelect}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    className="h-[184px] justify-between overflow-hidden rounded-3xl bg-primary p-5"
    style={{ width, borderWidth: 3, borderColor: selected ? colors.secondary : "transparent" }}
  >
    {/* decorative arcs */}
    <View pointerEvents="none" className="absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/10" />
    <View pointerEvents="none" className="absolute -right-32 -top-36 h-96 w-96 rounded-full border border-white/5" />
    <View pointerEvents="none" className="absolute -right-44 -top-48 rounded-full border-2 border-secondary/30" style={{ width: 440, height: 440 }} />

    <View className="flex-row items-start justify-between">
      <View>
        <BaseText weight="semibold" className="text-2xs uppercase tracking-widest text-white/60">
          {account.accountType}
        </BaseText>
        <BaseText weight="semibold" className="mt-1 text-base text-white">
          {account.alias || account.accountName}
        </BaseText>
      </View>
      <View className="rounded-full bg-white/10 px-2.5 py-1">
        <BaseText weight="semibold" className="text-2xs uppercase text-white">
          {account.accountStatus}
        </BaseText>
      </View>
    </View>

    <View>
      <BaseText className="text-xs text-white/60">{t("Available balance")}</BaseText>
      <View className="mt-1 flex-row items-center gap-3">
        <BaseText weight="bold" className="text-2xl text-white" style={{ fontVariant: ["tabular-nums"] }}>
          {"\u200E"}
          {visible && balance ? formatAmount(balance.AvailableBalance, account.currency) : `${account.currency} ••••••`}
        </BaseText>
        <Pressable
          onPress={onToggle}
          hitSlop={10}
          accessibilityLabel={visible ? t("Hide balance") : t("Show balance")}
          className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={16} color="#fff" />}
        </Pressable>
      </View>
    </View>

    <BaseText weight="medium" className="text-sm tracking-widest text-white/80">
      {maskAccount(account.accountNumber)}
    </BaseText>
  </Pressable>
);

export default DAccountCard;
