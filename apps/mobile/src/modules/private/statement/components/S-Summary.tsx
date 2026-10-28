import { View } from "react-native";
import { formatAmount, type StatementSummary, t } from "@mf-bank/shared";
import BaseText from "@/shared/ui/base/BaseText";

const Stat = ({ label, value, tone = "" }: { label: string; value: string; tone?: string }) => (
  <View className="min-w-[46%] flex-1 rounded-xl bg-surface px-3 py-2.5">
    <BaseText className="text-2xs text-muted">{label}</BaseText>
    <BaseText weight="semibold" className={`mt-0.5 text-sm ${tone}`} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </BaseText>
  </View>
);

const SSummary = ({ summary, currency }: { summary: StatementSummary; currency: string }) => (
  <View className="flex-row flex-wrap gap-2">
    <Stat label={t("Transactions")} value={String(summary.count)} />
    <Stat label={t("Net movement")} value={`${summary.net < 0 ? "−" : "+"}${formatAmount(Math.abs(summary.net), currency)}`} tone={summary.net < 0 ? "text-danger" : "text-secondary-dark"} />
    <Stat label={t("Total credits")} value={formatAmount(summary.totalCredit, currency)} tone="text-secondary-dark" />
    <Stat label={t("Total debits")} value={formatAmount(summary.totalDebit, currency)} />
  </View>
);

export default SSummary;
