import { useCallback, useEffect, useMemo } from "react";
import { publicResendOtp } from "../api/services/common.api";
import {
  recoverySetPassword,
  recoveryValidateAnswers,
  recoveryValidateOtp,
  recoveryValidateUser,
} from "../api/services/recovery.api";
import { getConfig } from "../config/platform";
import {
  RECOVERY_STEPS,
  setRecoveryOtp,
  setRecoveryStep,
  setRecoverySuccess,
  setRecoveryUser,
  startRecovery,
} from "../store/slices/recoverySlice";
import type { RecoveryMode, RecoveryUserDetailsForm } from "../types";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { t } from "../i18n";

/**
 * Forgot Password & Forgot Username share one flow:
 *   details (CIF + email) → security answers → OTP → [new password] → success
 */
export const useRecovery = (mode: RecoveryMode) => {
  const dispatch = useAppDispatch();
  const rec = useAppSelector((s) => s.recovery);
  const { execute, loading } = useAsync();

  // fresh state whenever the flow is opened
  useEffect(() => {
    dispatch(startRecovery(mode));
  }, [dispatch, mode]);

  const user = useMemo(() => ({ cif: rec.cif, email: rec.email }), [rec.cif, rec.email]);

  const submitDetails = useCallback(
    async (v: RecoveryUserDetailsForm) => {
      const payload = { cif: v.cif.trim(), email: v.email.trim().toLowerCase() };
      const res = await execute(() => recoveryValidateUser(mode, payload));
      if (!res?.success) return false;
      dispatch(setRecoveryUser({ ...payload, questions: res.data.Message }));
      return true;
    },
    [dispatch, execute, mode],
  );

  /** answers keyed by question id, sent as QA1..QAn in question order */
  const submitAnswers = useCallback(
    async (answers: Record<string, string>) => {
      const qa = Object.fromEntries(
        rec.questions.map((q, i) => [`QA${i + 1}`, (answers[q.id] ?? "").trim()]),
      ) as Record<`QA${number}`, string>;
      const res = await execute(() => recoveryValidateAnswers(mode, { ...user, ...qa }));
      if (!res?.success) return false;
      dispatch(
        setRecoveryOtp({
          message: res.data.Message.message,
          otpTimer: Number(res.data.Message.otpTimer) || 60,
        }),
      );
      return true;
    },
    [dispatch, execute, mode, rec.questions, user],
  );

  const submitOtp = useCallback(
    async (otp: string) => {
      const res = await execute(() => recoveryValidateOtp(mode, { ...user, otp }));
      if (!res?.success) return false;
      if (mode === "username") dispatch(setRecoverySuccess(res.data.Message));
      else dispatch(setRecoveryStep(3));
      return true;
    },
    [dispatch, execute, mode, user],
  );

  const submitNewPassword = useCallback(
    async (password: string, confirm: string) => {
      const res = await execute(() => recoverySetPassword({ ...user, newPass: password, reTypeNewPass: confirm }));
      if (!res?.success) return false;
      dispatch(setRecoverySuccess(res.data.Message));
      return true;
    },
    [dispatch, execute, user],
  );

  const resendOtp = useCallback(async () => {
    const serviceName = mode === "password" ? "ForgotPassword" : "ForgotUsername";
    const res = await execute(() => publicResendOtp({ serviceName, email: rec.email }));
    if (res?.success) getConfig().toast.success(res.data.Message.otpScreenMsg);
    return !!res?.success;
  }, [execute, mode, rec.email]);

  return {
    ...rec,
    steps: RECOVERY_STEPS[mode].map((s) => t(s)),
    loading,
    submitDetails,
    submitAnswers,
    submitOtp,
    submitNewPassword,
    resendOtp,
    back: () => dispatch(setRecoveryStep(Math.max(0, rec.step - 1))),
  };
};

export const useForgotPassword = () => useRecovery("password");
export const useForgotUsername = () => useRecovery("username");
