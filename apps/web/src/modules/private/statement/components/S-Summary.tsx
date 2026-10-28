import { formatAmount, type StatementSummary, t } from "@mf-bank/shared";

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <div className="rounded-xl bg-surface px-4 py-3">
    <div className="text-xs text-muted">{label}</div>
    <div dir="ltr" className={`text-start rtl:text-end mt-0.5 text-base font-semibold tabular-nums ${tone ?? "text-primary"}`}>{value}</div>
  </div>
);

const SSummary = ({ summary, currency }: { summary: StatementSummary; currency: string }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    <Stat label={t("Transactions")} value={String(summary.count)} />
    <Stat label={t("Total credits")} value={formatAmount(summary.totalCredit, currency)} tone="text-secondary-dark" />
    <Stat label={t("Total debits")} value={formatAmount(summary.totalDebit, currency)} />
    <Stat
      label={t("Net movement")}
      value={`${summary.net < 0 ? "−" : "+"}${formatAmount(Math.abs(summary.net), currency)}`}
      tone={summary.net < 0 ? "text-danger" : "text-secondary-dark"}
    />
  </div>
);

export default SSummary;
