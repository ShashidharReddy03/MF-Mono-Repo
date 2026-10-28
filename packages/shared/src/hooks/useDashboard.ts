import { useCallback, useEffect, useState } from "react";
import { fetchBalance, fetchMiniStatement } from "../api/services/dashboard.api";
import type { Balance, MiniFilter, MiniTransactionData } from "../types";
import { greeting } from "../utils/format";
import { useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";

const EMPTY_MINI: MiniTransactionData = { ALL: [], CREDIT: [], DEBIT: [] };

/**
 * Balances are fetched lazily and hidden by default (shoulder-surfing
 * protection); the user taps the eye icon to reveal each one.
 */
export const useDashboard = () => {
  const meta = useAppSelector((s) => s.auth.meta);
  const accounts = useAppSelector((s) => s.auth.sourceAccountList);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.accountNumber ?? "");

  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [balanceLoading, setBalanceLoading] = useState<string | null>(null);

  const [mini, setMini] = useState<MiniTransactionData>(EMPTY_MINI);
  const [currency, setCurrency] = useState("");
  const [filter, setFilter] = useState<MiniFilter>("ALL");
  const { execute: execBalance } = useAsync();
  const { execute: execMini, loading: miniLoading } = useAsync();

  const toggleBalance = useCallback(
    async (account: string) => {
      if (visible[account]) {
        setVisible((v) => ({ ...v, [account]: false }));
        return;
      }
      if (!balances[account]) {
        setBalanceLoading(account);
        const res = await execBalance(() => fetchBalance({ Account: account }));
        setBalanceLoading(null);
        if (!res?.success) return;
        setBalances((b) => ({ ...b, [account]: res.data.Message }));
      }
      setVisible((v) => ({ ...v, [account]: true }));
    },
    [balances, execBalance, visible],
  );

  const loadMini = useCallback(async () => {
    if (!selectedAccount) return;
    const res = await execMini(() => fetchMiniStatement({ account: selectedAccount, dashboard: "Y" }));
    if (res?.success) {
      const { ALL, CREDIT, DEBIT, Currency } = res.data.Message;
      setMini({ ALL, CREDIT, DEBIT });
      setCurrency(Currency);
    } else {
      setMini(EMPTY_MINI);
    }
  }, [execMini, selectedAccount]);

  useEffect(() => {
    void loadMini();
  }, [loadMini]);

  return {
    meta,
    greeting: greeting(),
    accounts,
    selectedAccount,
    setSelectedAccount,
    balances,
    visible,
    balanceLoading,
    toggleBalance,
    transactions: mini[filter],
    currency,
    filter,
    setFilter,
    miniLoading,
    reloadMini: loadMini,
  };
};
