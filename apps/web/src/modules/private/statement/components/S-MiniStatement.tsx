import { Skeleton } from "antd";
import type { MiniFilter, MiniTransactionRow } from "@mf-bank/shared";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import { TransactionRows } from "@/modules/private/dashboard/components/D-Transactions";
import { t } from "@mf-bank/shared";

type Props = {
  rows: MiniTransactionRow[];
  currency: string;
  filter: MiniFilter;
  onFilter: (f: MiniFilter) => void;
  loading: boolean;
};

const SMiniStatement = ({ rows, currency, filter, onFilter, loading }: Props) => (
  <div>
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">{t("Your last 10 transactions.")}</p>
      <BaseSegmented<MiniFilter>
        value={filter}
        onChange={onFilter}
        options={[
          { get label() { return t("All"); }, value: "ALL" },
          { get label() { return t("Credits"); }, value: "CREDIT" },
          { get label() { return t("Debits"); }, value: "DEBIT" },
        ]}
      />
    </div>
    {loading ? (
      <Skeleton active paragraph={{ rows: 6 }} />
    ) : rows.length ? (
      <TransactionRows rows={rows} currency={currency} />
    ) : (
      <BaseEmpty title={t("No recent transactions")} />
    )}
  </div>
);

export default SMiniStatement;
