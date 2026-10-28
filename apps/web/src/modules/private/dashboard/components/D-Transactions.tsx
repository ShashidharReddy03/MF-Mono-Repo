import type { ReactNode } from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import type { MiniFilter, MiniTransactionRow } from "@mf-bank/shared";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import AmountText from "@/shared/ui/components/AmountText";
import { t } from "@mf-bank/shared";

type Props = {
  rows: MiniTransactionRow[];
  currency: string;
  filter: MiniFilter;
  onFilter: (f: MiniFilter) => void;
  loading: boolean;
  footer?: ReactNode;
};

const FILTERS: { label: string; value: MiniFilter }[] = [
  { get label() { return t("All"); }, value: "ALL" },
  { get label() { return t("Credits"); }, value: "CREDIT" },
  { get label() { return t("Debits"); }, value: "DEBIT" },
];

/** Recent transactions list — also reused by the mini statement tab */
export const TransactionRows = ({ rows, currency }: { rows: MiniTransactionRow[]; currency: string }) => (
  <ul className="divide-y divide-primary/5">
    {rows.map((tx) => (
      <li key={tx.TransactionId} className="flex items-center gap-3 py-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            tx.Indicator === "Cr" ? "bg-secondary-light text-secondary-dark" : "bg-surface text-primary"
          }`}
        >
          {tx.Indicator === "Cr" ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-primary">
            {tx.Description || (tx.Indicator === "Cr" ? t("Credit") : t("Debit"))}
          </div>
          <div className="text-xs text-muted">
            {tx.Date} · {t("Ref")} {tx.TransactionId}
          </div>
        </div>
        <AmountText amount={tx.Amount} indicator={tx.Indicator} currency={currency} className="text-sm" />
      </li>
    ))}
  </ul>
);

const DTransactions = ({ rows, currency, filter, onFilter, loading, footer }: Props) => (
  <section className="rounded-2xl border border-primary/10 bg-white p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-primary">{t("Recent transactions")}</h2>
      <BaseSegmented<MiniFilter> value={filter} onChange={onFilter} options={FILTERS} />
    </div>
    {loading ? (
      <Skeleton active paragraph={{ rows: 5 }} />
    ) : rows.length ? (
      <TransactionRows rows={rows} currency={currency} />
    ) : (
      <BaseEmpty title={t("No transactions to show")} />
    )}
    {footer}
  </section>
);

export default DTransactions;
