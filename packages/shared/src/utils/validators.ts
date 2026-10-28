import { fieldLabel, getLanguage, t } from "../i18n";
/**
 * Framework-agnostic validators. Each returns an error string or undefined.
 * - Web adapts them to antd `Rule`s        (apps/web/src/core/utils/antdRules.ts)
 * - Mobile adapts them to react-hook-form   (apps/mobile/src/core/utils/rhfRules.ts)
 * so both platforms show identical messages from one source.
 */
export type Validator = (value: unknown, all?: Record<string, unknown>) => string | undefined;

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

export const PATTERNS = {
  email:
    /^(?![._%+-])[A-Za-z0-9._%+-]+(?<![._%+-])@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/,
  mobile: /^\d{7}$/,
  username: /^[a-zA-Z0-9]+$/,
  accountNumber: /^\d{10,16}$/,
  cif: /^\d{6,12}$/,
  otp: /^\d{6}$/,
  noSpaces: /^\S*$/,
} as const;

export const validators = {
  required:
    (label: string): Validator =>
    (v) =>
      str(v).trim() ? undefined : t("Please enter {{field}}", { field: fieldLabel(label) }),

  requiredSelect:
    (label: string): Validator =>
    (v) =>
      str(v) ? undefined : t("Please select {{field}}", { field: fieldLabel(label) }),

  requiredCheckbox:
    (message = "Please accept the terms and conditions"): Validator =>
    (v) =>
      v === true ? undefined : t(message),

  minLength:
    (n: number, kind: "chars" | "digits" = "chars"): Validator =>
    (v) =>
      !str(v) || str(v).trim().length >= n ? undefined : t(kind === "digits" ? "Minimum {{n}} digits required" : "Minimum {{n}} characters required", { n }),

  pattern:
    (re: RegExp, message: string): Validator =>
    (v) =>
      !str(v) || re.test(str(v)) ? undefined : t(message),

  email: (): Validator => validators.pattern(PATTERNS.email, "Please enter a valid email address"),
  mobile: (): Validator => validators.pattern(PATTERNS.mobile, "Please enter a valid 7-digit mobile number"),
  username: (): Validator => validators.pattern(PATTERNS.username, "Only alphabets and numbers are allowed"),
  accountNumber: (): Validator =>
    validators.pattern(PATTERNS.accountNumber, "Please enter a valid account number"),
  cif: (): Validator => validators.pattern(PATTERNS.cif, "Please enter a valid CIF number"),
  otp: (): Validator => validators.pattern(PATTERNS.otp, "Please enter the 6-digit OTP"),

  /** MPIN on the login page: digits only, exact length */
  mpinFormat: (length: number): Validator => (v) => {
    const s = str(v);
    if (!s) return undefined;
    return new RegExp(`^\\d{${length}}$`).test(s) ? undefined : t("MPIN must be {{n}} digits", { n: length });
  },

  /** Creating an MPIN (registration): digits only, exact length, not easy to guess (no 111111, 123456, 654321…) */
  mpin: (length: number): Validator => (v) => {
    const s = str(v);
    if (!s) return undefined;
    if (!new RegExp(`^\\d{${length}}$`).test(s)) return t("MPIN must be {{n}} digits", { n: length });
    if (isWeakMpin(s)) return t("Choose a less obvious MPIN (no repeated or sequential digits)");
    return undefined;
  },

  /** All password complexity rules → first failing message */
  strongPassword: (): Validator => (v) => {
    const s = str(v);
    if (!s) return undefined;
    const failed = PASSWORD_RULES.find((r) => !r.test(s));
    return failed ? t("Password must contain {{rule}}", { rule: getLanguage() === "en" ? failed.label.toLowerCase() : failed.label }) : undefined;
  },

  matchField:
    (field: string, message = "Passwords do not match"): Validator =>
    (v, all) =>
      !str(v) || str(v) === str(all?.[field]) ? undefined : t(message),

  /** Answers to security questions must be unique (case-insensitive) */
  uniqueAmong:
    (current: string, fields: string[], message = "Answers must be unique"): Validator =>
    (v, all) => {
      const val = str(v).trim().toLowerCase();
      if (!val) return undefined;
      const dup = fields.some((f) => f !== current && str(all?.[f]).trim().toLowerCase() === val);
      return dup ? t(message) : undefined;
    },

  /** Amount entered must be greater than zero ("1,250.00" style input) */
  amount:
    (message = "Please enter a valid amount"): Validator =>
    (v) => {
      if (!str(v)) return undefined;
      const n = Number(str(v).replace(/,/g, ""));
      return Number.isFinite(n) && n > 0 ? undefined : t(message);
    },

  /** e.g. shares membership accounts accept multiples of 100 only (MF-React-SCU rule) */
  multipleOf:
    (step: number, message = "Amount must be in multiples of {{n}}"): Validator =>
    (v) => {
      if (!str(v)) return undefined;
      const n = Number(str(v).replace(/,/g, ""));
      return n % step === 0 ? undefined : t(message, { n: step });
    },

  /** Amount must not exceed a maximum (e.g. the bank's global transfer limit) */
  maxAmount:
    (max: number, message = "Amount cannot exceed {{max}}"): Validator =>
    (v) => {
      if (!str(v)) return undefined;
      const n = Number(str(v).replace(/,/g, ""));
      return n <= max ? undefined : t(message, { max: max.toLocaleString("en-US") });
    },
};

/** Account type that only accepts multiples of 100 (MF-React-SCU own / same-bank transfer rule) */
export const isSharesAccount = (accountType?: string) => accountType?.trim().toLowerCase() === "shares membership account";

/** Run a list of validators, return the first error */
export const runValidators = (
  list: Validator[],
  value: unknown,
  all?: Record<string, unknown>,
): string | undefined => {
  for (const v of list) {
    const err = v(value, all);
    if (err) return err;
  }
  return undefined;
};

// ---- Password policy (same as demo: 8+ chars, upper, lower, digit, !@#&*) ----
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 12;

export const PASSWORD_RULES = [
  // labels are getters so they're translated in the language active at render time
  { key: "minLength", get label() { return t("At least {{n}} characters", { n: PASSWORD_MIN }); }, test: (p: string) => p.length >= PASSWORD_MIN },
  { key: "uppercase", get label() { return t("One uppercase letter"); }, test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", get label() { return t("One lowercase letter"); }, test: (p: string) => /[a-z]/.test(p) },
  { key: "number", get label() { return t("One number"); }, test: (p: string) => /\d/.test(p) },
  { key: "special", get label() { return t("One special character (!@#&*)"); }, test: (p: string) => /[!@#&*]/.test(p) },
] as const;

export const evaluatePassword = (password = "") =>
  PASSWORD_RULES.map((r) => ({ key: r.key, label: r.label, passed: r.test(password) }));

/** Same digit repeated, or a straight run up or down (0123…, 9876…, wrapping 890123) */
export const isWeakMpin = (pin: string) => {
  if (/^(\d)\1+$/.test(pin)) return true;
  const d = pin.split("").map(Number);
  const steps = d.slice(1).map((n, i) => (n - d[i] + 10) % 10);
  return steps.every((s) => s === 1) || steps.every((s) => s === 9);
};
