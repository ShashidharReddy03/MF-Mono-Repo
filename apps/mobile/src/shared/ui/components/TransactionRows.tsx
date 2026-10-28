import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, formatAmount, type MiniTransactionRow, t } from "@mf-bank/shared";
import BaseText from "../base/BaseText";
import AmountText from "./AmountText";

type Row = MiniTransactionRow & { Balance?: string };

/** Transaction list used by the dashboard and both statement views */
const TransactionRows = ({ rows, currency }: { rows: Row[]; currency?: string }) => (
  <View>
    {rows.map((tx, i) => (
      <View key={tx.TransactionId} className={`flex-row items-center gap-3 py-3 ${i ? "border-t border-primary/5" : ""}`}>
        <View className={`h-10 w-10 items-center justify-center rounded-full ${tx.Indicator === "Cr" ? "bg-secondary-light" : "bg-surface"}`}>
          <Ionicons
            name={tx.Indicator === "Cr" ? "arrow-down" : "arrow-up"}
            size={18}
            color={tx.Indicator === "Cr" ? colors.secondaryDark : colors.primary}
          />
        </View>
        <View className="flex-1">
          <BaseText weight="medium" className="text-sm" numberOfLines={1}>
            {tx.Description || (tx.Indicator === "Cr" ? t("Credit") : t("Debit"))}
          </BaseText>
          <BaseText className="text-xs text-muted" numberOfLines={1}>
            {tx.Date} · {t("Ref")} {tx.TransactionId}
          </BaseText>
        </View>
        <View className="items-end">
          <AmountText amount={tx.Amount} indicator={tx.Indicator} currency={currency} className="text-sm" />
          {tx.Balance && <BaseText className="text-2xs text-muted">{t("Bal")} {"\u200E"}{formatAmount(tx.Balance)}</BaseText>}
        </View>
      </View>
    ))}
  </View>
);

export default TransactionRows;
