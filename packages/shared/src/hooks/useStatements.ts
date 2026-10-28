import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchMiniStatement } from "../api/services/dashboard.api";
import { fetchFullStatement } from "../api/services/statement.api";
import { getConfig } from "../config/platform";
import type {
  FullStatementData,
  FullStatementTransactionRow,
  MiniFilter,
  MiniTransactionData,
  StatementFormat,
  StatementRangePreset,
  StatementSummary,
} from "../types";
import { resolvePresetRange, toApiDate, validateStatementRange, type DateRange } from "../utils/date";
import { parseAmount, toCsv } from "../utils/format";
import { useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { t } from "../i18n";

export type StatementMode = "mini" | "full";

export type StatementDownload =
  | { kind: "url"; url: string; format: StatementFormat }
  | { kind: "csv"; filename: string; content: string };

export const summarise = (rows: { Amount: string; Indicator: "Cr" | "Dr" }[]): StatementSummary => {
  const totalCredit = rows.filter((r) => r.Indicator === "Cr").reduce((s, r) => s + parseAmount(r.Amount), 0);
  const totalDebit = rows.filter((r) => r.Indicator === "Dr").reduce((s, r) => s + parseAmount(r.Amount), 0);
  return { count: rows.length, totalCredit, totalDebit, net: totalCredit - totalDebit };
};

export const useStatements = (initialAccount?: string) => {
  const accounts = useAppSelector((s) => s.auth.sourceAccountList);
  const [account, setAccount] = useState(initialAccount ?? accounts[0]?.accountNumber ?? "");
  const [mode, setMode] = useState<StatementMode>("mini");

  // ---- mini ----
  const [mini, setMini] = useState<MiniTransactionData>({ ALL: [], CREDIT: [], DEBIT: [] });
  const [miniFilter, setMiniFilter] = useState<MiniFilter>("ALL");
  const { execute: execMini, loading: miniLoading } = useAsync();

  // ---- full ----
  const [preset, setPreset] = useState<StatementRangePreset>("current");
  const [customRange, setCustomRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [full, setFull] = useState<FullStatementData | null>(null);
  const { execute: execFull, loading: fullLoading } = useAsync();
  const { execute: execDownload, loading: downloading } = useAsync();

  const currency = accounts.find((a) => a.accountNumber === account)?.currency ?? "";

  const loadMini = useCallback(async () => {
    if (!account) return;
    const res = await execMini(() => fetchMiniStatement({ account, dashboard: "N" }));
    if (res?.success) {
      const { ALL, CREDIT, DEBIT } = res.data.Message;
      setMini({ ALL, CREDIT, DEBIT });
    }
  }, [account, execMini]);

  useEffect(() => {
    if (mode === "mini") void loadMini();
    setFull(null);
  }, [loadMini, mode]);

  /** Resolved range for the current preset (or error for bad custom range) */
  const range = useMemo((): { value?: DateRange; error?: string } => {
    if (preset !== "custom") return { value: resolvePresetRange(preset) };
    const error = validateStatementRange(customRange.from, customRange.to);
    return error ? { error } : { value: { from: customRange.from!, to: customRange.to! } };
  }, [customRange, preset]);

  const buildPayload = useCallback(
    (format: StatementFormat) => {
      if (!range.value) return null;
      return {
        Account: account,
        FromDate: toApiDate(range.value.from),
        ToDate: toApiDate(range.value.to),
        format,
      };
    },
    [account, range.value],
  );

  const loadFull = useCallback(async () => {
    const payload = buildPayload("view");
    if (!payload) {
      getConfig().toast.error(range.error ?? t("Please select a valid date range"));
      return false;
    }
    const res = await execFull(() => fetchFullStatement(payload));
    if (res?.success && "Transactions" in res.data.Message) {
      setFull(res.data.Message);
      return true;
    }
    setFull(null);
    return false;
  }, [buildPayload, execFull, range.error]);

  /**
   * Server-generated PDF/XLS when available (ReportURL); otherwise a local
   * CSV of the rows on screen. The platform layer decides how to save it.
   */
  const download = useCallback(
    async (format: Exclude<StatementFormat, "view">): Promise<StatementDownload | null> => {
      const payload = buildPayload(format);
      if (!payload) return null;
      const res = await execDownload(() => fetchFullStatement(payload));
      if (res?.success && "ReportURL" in res.data.Message && res.data.Message.ReportURL) {
        return { kind: "url", url: res.data.Message.ReportURL, format };
      }
      if (!full?.Transactions.length) {
        getConfig().toast.info?.("View the statement first to export it.");
        return null;
      }
      const cols: (keyof FullStatementTransactionRow)[] = [
        "Date", "TransactionId", "Description", "Indicator", "Amount", "Balance",
      ];
      return {
        kind: "csv",
        filename: `statement_${account}_${payload.FromDate}_${payload.ToDate}.csv`,
        content: toCsv(full.Transactions, cols),
      };
    },
    [account, buildPayload, execDownload, full],
  );

  const miniRows = mini[miniFilter];
  const summary = useMemo(
    () => summarise(mode === "mini" ? mini.ALL : (full?.Transactions ?? [])),
    [full, mini.ALL, mode],
  );

  return {
    accounts,
    account,
    setAccount,
    currency,
    mode,
    setMode,
    // mini
    miniRows,
    miniFilter,
    setMiniFilter,
    miniLoading,
    reloadMini: loadMini,
    // full
    preset,
    setPreset,
    customRange,
    setCustomRange,
    rangeError: range.error,
    range: range.value,
    full,
    fullLoading,
    loadFull,
    download,
    downloading,
    summary,
  };
};
