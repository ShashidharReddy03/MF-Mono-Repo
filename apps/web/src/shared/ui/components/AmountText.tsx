import { formatAmount } from "@mf-bank/shared";

/** Credits in green with "+", debits neutral with "−". Always tabular figures. */
const AmountText = ({ amount, indicator, currency, className = "" }: { amount: string | number; indicator?: "Cr" | "Dr"; currency?: string; className?: string }) => (
  <span dir="ltr" className={`inline-block tabular-nums font-semibold ${indicator === "Cr" ? "text-secondary-dark" : "text-primary"} ${className}`}>
    {indicator === "Cr" ? "+" : indicator === "Dr" ? "−" : ""}
    {formatAmount(amount, currency)}
  </span>
);

export default AmountText;
