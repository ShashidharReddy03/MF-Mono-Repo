import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteBeneficiary, fetchBeneficiaryList } from "../api/services/beneficiary.api";
import { getConfig } from "../config/platform";
import { setBeneficiaryList } from "../store/slices/authSlice";
import type { Beneficiary, BeneficiaryType } from "../types";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { t } from "../i18n";

export type BeneficiaryFilter = "ALL" | BeneficiaryType;

export const BENEFICIARY_TYPE_LABEL: Record<BeneficiaryType, string> = {
  get SCU() { return t("MF Bank"); },
  get LOCAL() { return t("Other Bank"); },
};

export const useBeneficiaries = (autoLoad = true) => {
  const dispatch = useAppDispatch();
  const list = useAppSelector((s) => s.auth.beneficiaryList);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BeneficiaryFilter>("ALL");
  const { execute, loading } = useAsync();
  const { execute: execDelete, loading: deleting } = useAsync();

  const refresh = useCallback(async () => {
    const res = await execute(() => fetchBeneficiaryList());
    if (res?.success) dispatch(setBeneficiaryList(res.data.Message ?? []));
  }, [dispatch, execute]);

  useEffect(() => {
    if (autoLoad) void refresh();
  }, [autoLoad, refresh]);

  const remove = useCallback(
    async (b: Beneficiary) => {
      const res = await execDelete(() => deleteBeneficiary({ benId: b.benid }));
      if (!res?.success) return false;
      getConfig().toast.success(res.message ?? t("Beneficiary deleted successfully"));
      dispatch(setBeneficiaryList(list.filter((x) => x.benid !== b.benid)));
      return true;
    },
    [dispatch, execDelete, list],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter(
      (b) =>
        (typeFilter === "ALL" || b.Type === typeFilter) &&
        (!q ||
          b.beneficiaryName.toLowerCase().includes(q) ||
          b["Alias Name"].toLowerCase().includes(q) ||
          b.beneficiaryAcno.includes(q)),
    );
  }, [list, search, typeFilter]);

  const counts = useMemo(
    () => ({
      ALL: list.length,
      SCU: list.filter((b) => b.Type === "SCU").length,
      LOCAL: list.filter((b) => b.Type === "LOCAL").length,
    }),
    [list],
  );

  return { list, filtered, counts, search, setSearch, typeFilter, setTypeFilter, loading, deleting, refresh, remove };
};
