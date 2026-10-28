import { t } from "@mf-bank/shared";
/** Wordmark: a monogram tile + name. Light variant for navy backgrounds. */
const Logo = ({ light = false, compact = false }: { light?: boolean; compact?: boolean }) => (
  <div className="flex items-center gap-2.5 select-none">
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-sm font-bold tracking-tight text-white">
      MF
    </div>
    {!compact && (
      <div className="leading-tight">
        <div className={`text-base font-bold ${light ? "text-white" : "text-primary"}`}>MF Bank</div>
        <div className={`text-2xs font-medium ${light ? "text-white/60" : "text-muted"}`}>{t("Internet Banking")}</div>
      </div>
    )}
  </div>
);

export default Logo;
