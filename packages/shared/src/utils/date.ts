import dayjs from "dayjs";
import type { StatementRangePreset } from "../types";
import { t } from "../i18n";

export const API_DATE_FORMAT = "DD-MM-YYYY";
export const DISPLAY_DATE_FORMAT = "DD MMM YYYY";
/** Backend allows statements up to 6 months back */
export const STATEMENT_MAX_MONTHS = 6;

/** Always English digits/format for the server, whatever the UI language */
export const toApiDate = (d: Date) => dayjs(d).locale("en").format(API_DATE_FORMAT);
export const toDisplayDate = (d: Date) => dayjs(d).format(DISPLAY_DATE_FORMAT);

export type DateRange = { from: Date; to: Date };

export const STATEMENT_PRESETS: { key: StatementRangePreset; label: string }[] = [
  { key: "current", get label() { return t("This month"); } },
  { key: "last1", get label() { return t("Last 1 month"); } },
  { key: "last3", get label() { return t("Last 3 months"); } },
  { key: "custom", get label() { return t("Custom"); } },
];

export const resolvePresetRange = (preset: Exclude<StatementRangePreset, "custom">): DateRange => {
  const today = dayjs();
  switch (preset) {
    case "current":
      return { from: today.startOf("month").toDate(), to: today.toDate() };
    case "last1":
      return { from: today.subtract(1, "month").toDate(), to: today.toDate() };
    case "last3":
      return { from: today.subtract(3, "month").toDate(), to: today.toDate() };
  }
};

export const minStatementDate = () => dayjs().subtract(STATEMENT_MAX_MONTHS, "month").startOf("day").toDate();

/** Business rule check for custom ranges; returns an error message or undefined */
export const validateStatementRange = (from?: Date | null, to?: Date | null) => {
  if (!from || !to) return "Please select both From and To dates";
  if (dayjs(to).isBefore(from, "day")) return "To date cannot be before From date";
  if (dayjs(to).isAfter(dayjs(), "day")) return "To date cannot be in the future";
  if (dayjs(from).isBefore(minStatementDate(), "day"))
    return t("Statements are available for the last {{n}} months only", { n: STATEMENT_MAX_MONTHS });
  return undefined;
};
