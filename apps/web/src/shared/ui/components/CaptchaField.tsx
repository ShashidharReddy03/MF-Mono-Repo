import { ReloadOutlined } from "@ant-design/icons";
import { validators, t } from "@mf-bank/shared";
import { required } from "@/core/utils/antdRules";
import FormInput from "../form/FormInput";

type CaptchaFieldProps = { value: string; onRefresh: () => void; validate: (input: string) => boolean };

/**
 * Captcha text is rendered with per-character rotation + noise lines so it
 * isn't trivially OCR-able or selectable. Validated client-side only — it's
 * a friction layer; the server still rate-limits logins.
 */
const CaptchaField = ({ value, onRefresh, validate }: CaptchaFieldProps) => (
  <div className="grid grid-cols-2 items-start gap-3">
    <div className="flex items-center gap-2">
      <div
        aria-label={t("Captcha image")}
        className="captcha relative flex h-[42px] flex-1 select-none items-center justify-center overflow-hidden rounded-lg border border-dashed border-primary/30 bg-surface"
      >
        {value.split("").map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="mx-[1px] text-lg font-bold text-primary"
            style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (6 + i * 2)}deg) translateY(${i % 3 === 0 ? -2 : 2}px)` }}
          >
            {ch}
          </span>
        ))}
        <span className="pointer-events-none absolute inset-x-2 top-1/2 h-px -rotate-6 bg-primary/30" />
      </div>
      <button type="button" onClick={onRefresh} aria-label={t("New captcha")} className="p-1 text-secondary hover:text-secondary-dark">
        <ReloadOutlined />
      </button>
    </div>
    <FormInput
      name="captcha"
      inputType="alphanumeric"
      placeholder={t("Enter captcha")}
      maxLength={6}
      rules={required("Captcha", (v) => (validate(String(v ?? "")) ? undefined : t("Captcha doesn't match")), validators.minLength(6))}
    />
  </div>
);

export default CaptchaField;
