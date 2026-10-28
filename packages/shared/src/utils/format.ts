import { t } from "../i18n";
/** "1,26,540.10" / "48250.75" → 48250.75 */
export const parseAmount = (value: string | number | undefined): number => {
  if (typeof value === "number") return value;
  const n = Number.parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const formatAmount = (value: string | number, currency?: string) => {
  const n = parseAmount(value);
  const s = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${s}` : s;
};

/** 1002003001 → XXXXXX3001 */
export const maskAccount = (acc = "", visible = 4) =>
  acc.length <= visible ? acc : "X".repeat(acc.length - visible) + acc.slice(-visible);

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return t("Good morning");
  if (h < 17) return t("Good afternoon");
  return t("Good evening");
};

/** Build a CSV string (RFC 4180 quoting) — used for client-side statement export */
export const toCsv = <T extends Record<string, unknown>>(rows: T[], columns: (keyof T)[]) => {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map(esc).join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n");
};
