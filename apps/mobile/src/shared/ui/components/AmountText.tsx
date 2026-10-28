import { formatAmount } from "@mf-bank/shared";
import BaseText from "../base/BaseText";

/** Credits green with "+", debits neutral with "−" (same rule as web) */
const AmountText = ({ amount, indicator, currency, className = "" }: { amount: string | number; indicator?: "Cr" | "Dr"; currency?: string; className?: string }) => (
  <BaseText
    weight="semibold"
    className={`${indicator === "Cr" ? "text-secondary-dark" : "text-primary"} ${className}`}
    style={{ fontVariant: ["tabular-nums"] }}
  >
    {"\u200E"}
    {indicator === "Cr" ? "+" : indicator === "Dr" ? "−" : ""}
    {formatAmount(amount, currency)}
  </BaseText>
);

export default AmountText;
