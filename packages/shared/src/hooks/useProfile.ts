import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeLimitsConf,
  changePasswordConf,
  changeSecurityQuestionsConf,
  fetchLinkedAccounts,
  fetchSecurityQuestions,
  PROFILE_FLOW,
} from "../api/services/profile.api";
import { getConfig } from "../config/platform";
import { t } from "../i18n";
import { updateLimits } from "../store/slices/authSlice";
import { resetAll } from "../store/store";
import type {
  ChangeLimitsForm,
  ChangePasswordForm,
  DetailsItem,
  LinkedAccount,
  SecurityQuestionLists,
  SecurityQuestionsForm,
} from "../types";
import { formatAmount, parseAmount } from "../utils/format";
import { toQuestionOptions, toSecurityAnswers } from "../utils/securityQuestions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { useAuthorisedAction } from "./useAuthorisedAction";

/** My Profile sections (MF-React-SCU: personal-info, change-password, change-limits, reset-security-questions) */
export type ProfileSection = "info" | "password" | "limits" | "security";
export const PROFILE_SECTIONS: { key: ProfileSection; readonly label: string }[] = [
  { key: "info", get label() { return t("Personal info"); } },
  { key: "password", get label() { return t("Change password"); } },
  { key: "limits", get label() { return t("Transfer limit"); } },
  { key: "security", get label() { return t("Security questions"); } },
];

/* ------------------------------------------------------------------ */
/* Personal info + linked accounts                                     */
/* ------------------------------------------------------------------ */

export const useProfile = () => {
  const meta = useAppSelector((s) => s.auth.meta);
  const sourceAccounts = useAppSelector((s) => s.auth.sourceAccountList);
  const { execute, loading } = useAsync();
  const [linked, setLinked] = useState<LinkedAccount[] | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await execute(() => fetchLinkedAccounts());
      if (res?.success) setLinked(res.data.Message ?? []);
    })();
  }, [execute]);

  /** Same fields as MF-React-SCU PersonalInfo */
  const details: DetailsItem[] = useMemo(
    () =>
      meta
        ? [
            { label: t("Name"), value: meta.CNAME },
            { label: t("Username"), value: meta.userName ?? "—" },
            { label: t("Customer ID (CIF)"), value: meta.CIF },
            { label: t("Mobile number"), value: `+248 ${meta.CMOBILE}` },
            { label: t("Email"), value: meta.customerEmail },
            { label: t("Last login"), value: meta.LastLogin },
            { label: t("Status"), value: meta.CustomerStatus },
          ]
        : [],
    [meta],
  );

  // fall back to the accounts returned at login if the list service isn't available
  const accounts: LinkedAccount[] = useMemo(
    () =>
      linked ??
      sourceAccounts.map((a) => ({
        accountName: a.accountName,
        accountType: a.accountType,
        currency: a.currency,
        accountNumber: a.accountNumber,
        status: a.accountStatus,
      })),
    [linked, sourceAccounts],
  );

  return { name: meta?.CNAME ?? "", details, accounts, loading };
};

/* ------------------------------------------------------------------ */
/* Change password — CHANGE_PASSWORD_CONF → OTP → SAVE_CHANGE_PASSWORD  */
/* ------------------------------------------------------------------ */

export const useChangePassword = () => {
  const dispatch = useAppDispatch();
  const { execute, loading } = useAsync();
  const action = useAuthorisedAction();

  const submit = useCallback(
    async (v: ChangePasswordForm) => {
      const res = await execute(() =>
        changePasswordConf({
          oldPassword: v.currentPassword.trim(),
          newPassword: v.password.trim(),
          confirmPassword: v.confPassword.trim(),
        }),
      );
      if (!res?.success) return false;
      return action.begin({ ...PROFILE_FLOW.password, mode: "OTP_ONLY" });
    },
    [action, execute],
  );

  /** Demo: success modal → "Back to Login" with the store reset */
  const finish = useCallback(() => dispatch(resetAll()), [dispatch]);

  return { submit, loading, action, finish };
};

/* ------------------------------------------------------------------ */
/* Reset security questions — CHANGE_SECQUESTIONS_CONF → OTP → FINAL     */
/* ------------------------------------------------------------------ */

export const useResetSecurityQuestions = () => {
  const { execute, loading } = useAsync();
  const action = useAuthorisedAction();
  const [lists, setLists] = useState<SecurityQuestionLists | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await execute(() => fetchSecurityQuestions());
      if (res?.success) setLists(res.data.Message);
    })();
  }, [execute]);

  const questionOptions = useMemo(() => toQuestionOptions(lists), [lists]);

  const submit = useCallback(
    async (v: SecurityQuestionsForm) => {
      const res = await execute(() =>
        changeSecurityQuestionsConf({ securityQuestions: toSecurityAnswers(v), forceChange: "N" }),
      );
      if (!res?.success) return false;
      return action.begin({ ...PROFILE_FLOW.securityQuestions, mode: "OTP_ONLY" });
    },
    [action, execute],
  );

  return { questionOptions, submit, loading, action };
};

/* ------------------------------------------------------------------ */
/* Change limits — CHANGE_LIMITS_CONF → OTP → CHANGE_LIMITS_FINAL       */
/* ------------------------------------------------------------------ */

export const useChangeLimits = () => {
  const dispatch = useAppDispatch();
  const meta = useAppSelector((s) => s.auth.meta);
  const { execute, loading } = useAsync();

  const currency = meta?.limitsCurrency ?? "SCR";
  const maxLimit = parseAmount(meta?.globalLimit);
  const currentLimit = Math.floor(parseAmount(meta?.currentAppLimit));
  const serviceOff = meta?.isLimitToggleOff === "Y";

  const action = useAuthorisedAction({
    onCompleted: (r) => {
      if (!r.success) return;
      // demo: read the new values back from the result details
      const newLimit = r.details.find((d) => d.label === "New Limit")?.value;
      const toggle = r.details.find((d) => d.label === "Toggle On/off")?.value;
      dispatch(
        updateLimits({
          currentAppLimit: newLimit,
          isLimitToggleOff: toggle === "Y" || toggle === "N" ? toggle : undefined,
        }),
      );
    },
  });

  const initialValues: ChangeLimitsForm = useMemo(
    () => ({ amount: formatAmount(serviceOff ? 0 : currentLimit), serviceOff }),
    [currentLimit, serviceOff],
  );

  /** Turning the service off sets the amount to 0; back on restores the current limit */
  const amountForToggle = useCallback(
    (off: boolean) => formatAmount(off ? 0 : currentLimit),
    [currentLimit],
  );

  const submit = useCallback(
    async (v: ChangeLimitsForm) => {
      const amountChanged = parseAmount(v.amount) !== parseAmount(initialValues.amount);
      const toggleChanged = v.serviceOff !== serviceOff;
      if (!amountChanged && !toggleChanged) {
        getConfig().toast.error(t("Please change the limit amount or service toggle before proceeding."));
        return false;
      }
      const res = await execute(() =>
        changeLimitsConf({ newLimit: String(parseAmount(v.amount)), isToggleOff: v.serviceOff ? "Y" : "N" }),
      );
      if (!res?.success) return false;
      return action.begin({ ...PROFILE_FLOW.limits, mode: "OTP_ONLY", confirmation: res.data.Message });
    },
    [action, execute, initialValues.amount, serviceOff],
  );

  return { currency, maxLimit, currentLimit, serviceOff, initialValues, amountForToggle, submit, loading, action };
};
