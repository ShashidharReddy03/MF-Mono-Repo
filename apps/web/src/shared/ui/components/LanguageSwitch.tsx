import { GlobalOutlined } from "@ant-design/icons";
import { SUPPORTED_LANGUAGES } from "@mf-bank/shared";
import { setWebLanguage, useLanguage } from "@/core/i18n/language";

/**
 * Shows the OTHER language's name in its own script ("العربية" / "English"),
 * which is what users look for when they can't read the current one.
 */
const LanguageSwitch = ({ light = false }: { light?: boolean }) => {
  const current = useLanguage();
  const next = SUPPORTED_LANGUAGES.find((l) => l.code !== current) ?? SUPPORTED_LANGUAGES[0];
  return (
    <button
      type="button"
      lang={next.code}
      onClick={() => void setWebLanguage(next.code)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        light ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-primary hover:bg-surface"
      }`}
    >
      <GlobalOutlined />
      {next.label}
    </button>
  );
};

export default LanguageSwitch;
