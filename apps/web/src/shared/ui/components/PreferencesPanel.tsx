import type { ReactNode } from "react";
import { CheckCircleFilled } from "@ant-design/icons";
import { getPalette, SUPPORTED_LANGUAGES, t, THEME_IDS, THEMES, type ThemeId } from "@mf-bank/shared";
import { setWebLanguage, useLanguage } from "@/core/i18n/language";
import { setWebTheme, useTheme } from "@/core/i18n/theme";

/** Card-style radio option shared by the language and theme groups */
const Option = ({ selected, onSelect, children, lang }: { selected: boolean; onSelect: () => void; children: ReactNode; lang?: string }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    lang={lang}
    onClick={onSelect}
    className={`relative flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-colors ${
      selected ? "border-secondary bg-secondary-light/60" : "border-primary/10 bg-white hover:border-primary/30"
    }`}
  >
    {children}
    {selected && <CheckCircleFilled className="ms-auto text-lg text-secondary" />}
  </button>
);

/** Small preview of a theme: its own colours, whatever theme is active */
const ThemeSwatch = ({ id }: { id: ThemeId }) => {
  const p = getPalette(id);
  return (
    <span className="flex h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-black/5" aria-hidden>
      <span className="flex-[2]" style={{ background: p.primary }} />
      <span className="flex-1" style={{ background: p.secondary }} />
      <span className="flex-1" style={{ background: p.surface }} />
    </span>
  );
};

/**
 * Language + theme preferences. Used by the Settings page (after login) and the
 * Preferences page (before login). Both choices apply instantly and are remembered
 * on this device; no session or customer data is stored.
 */
const PreferencesPanel = () => {
  const language = useLanguage();
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="pref-language">
        <h2 id="pref-language" className="text-base font-semibold text-primary">
          {t("Language")}
        </h2>
        <p className="mb-3 mt-1 text-sm text-muted">{t("Choose the language for menus, messages and forms.")}</p>
        <div role="radiogroup" aria-labelledby="pref-language" className="grid gap-3 sm:grid-cols-2">
          {SUPPORTED_LANGUAGES.map((l) => (
            <Option key={l.code} lang={l.code} selected={language === l.code} onSelect={() => void setWebLanguage(l.code)}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-sm font-bold text-primary">
                {l.code.toUpperCase()}
              </span>
              <span className="font-semibold text-primary">{l.label}</span>
            </Option>
          ))}
        </div>
      </section>

      <section aria-labelledby="pref-theme">
        <h2 id="pref-theme" className="text-base font-semibold text-primary">
          {t("Theme")}
        </h2>
        <p className="mb-3 mt-1 text-sm text-muted">{t("Choose the colours used across the app.")}</p>
        <div role="radiogroup" aria-labelledby="pref-theme" className="grid gap-3 sm:grid-cols-2">
          {THEME_IDS.map((id) => (
            <Option key={id} selected={theme === id} onSelect={() => setWebTheme(id)}>
              <ThemeSwatch id={id} />
              <span>
                <span className="block font-semibold text-primary">{THEMES[id].label}</span>
                {id === "classic" && <span className="block text-xs text-muted">{t("Default")}</span>}
              </span>
            </Option>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted">{t("Your choices are saved on this device only.")}</p>
    </div>
  );
};

export default PreferencesPanel;
