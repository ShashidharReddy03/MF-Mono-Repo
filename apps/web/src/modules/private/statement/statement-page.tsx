import { useLocation } from "react-router-dom";
import { maskAccount, useStatements, type StatementMode, t } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import BaseSelect from "@/shared/ui/base/BaseSelect";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import SMiniStatement from "./components/S-MiniStatement";
import SFullStatement from "./components/S-FullStatement";
import SSummary from "./components/S-Summary";

/** Saves a client-generated file (CSV fallback) without leaving the page */
const saveBlob = (content: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const StatementPage = () => {
  const location = useLocation();
  const s = useStatements((location.state as { account?: string } | null)?.account);

  const handleDownload = async (format: "pdf" | "xls") => {
    const file = await s.download(format);
    if (!file) return;
    if (file.kind === "url") window.open(file.url, "_blank", "noopener,noreferrer");
    else saveBlob(file.content, file.filename);
  };

  const showSummary = s.mode === "mini" ? !s.miniLoading : !!s.full;

  return (
    <>
      <PageHeader title={t("Statements")} description={t("Review recent activity or generate a statement for a period.")} />

      <div className="flex flex-col gap-5 rounded-2xl border border-primary/10 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="mb-1 block text-xs font-medium text-muted">{t("Account")}</label>
            <BaseSelect
              value={s.account}
              onChange={s.setAccount}
              showSearch={false}
              options={s.accounts.map((a) => ({
                value: a.accountNumber,
                label: `${a.alias || a.accountName} · ${maskAccount(a.accountNumber)}`,
              }))}
            />
          </div>
          <BaseSegmented<StatementMode>
            value={s.mode}
            onChange={s.setMode}
            options={[
              { get label() { return t("Mini statement"); }, value: "mini" },
              { get label() { return t("Full statement"); }, value: "full" },
            ]}
          />
        </div>

        {showSummary && <SSummary summary={s.summary} currency={s.currency} />}

        {s.mode === "mini" ? (
          <SMiniStatement
            rows={s.miniRows}
            currency={s.currency}
            filter={s.miniFilter}
            onFilter={s.setMiniFilter}
            loading={s.miniLoading}
          />
        ) : (
          <SFullStatement
            preset={s.preset}
            onPreset={s.setPreset}
            customRange={s.customRange}
            onCustomRange={s.setCustomRange}
            rangeError={s.rangeError}
            range={s.range}
            data={s.full}
            loading={s.fullLoading}
            downloading={s.downloading}
            onView={() => void s.loadFull()}
            onDownload={(f) => void handleDownload(f)}
          />
        )}
      </div>
    </>
  );
};

export default StatementPage;
