import { useCallback, useRef, useState } from "react";
import { authoriseAction } from "../api/services/authorise.api";
import { generateOtp } from "../api/services/common.api";
import { getConfig } from "../config/platform";
import { resetAll } from "../store/store";
import type { ConfirmationMessage, DetailsItem, FinalMessage } from "../types";
import { useAppDispatch } from "./hooks";
import { useAsync } from "./useAsync";

/**
 * Shared "confirm → (OTP) → result" engine for transfers and profile changes.
 * Port of MF-React-SCU's flow-confirmation-page + transferFlowSlice, as a hook
 * so web and mobile render it with their own components.
 *
 *   CONFIRM_ONLY  details → Confirm → final service (otp "")       e.g. own-account transfer
 *   CONFIRM_OTP   details → Confirm → OTP_GENERATION → OTP → final e.g. transfer to others
 *   OTP_ONLY      OTP_GENERATION → OTP → final                     e.g. change password
 *
 * The final call's Status decides the result: 00 success, 06 failed (shown, not toasted).
 * Codes 03/04 end the session (demo navigates to login; here the store reset does it).
 */
export type AuthoriseMode = "CONFIRM_ONLY" | "CONFIRM_OTP" | "OTP_ONLY";
export type AuthoriseStep = "idle" | "confirm" | "otp" | "result";

export type AuthoriseConfig = {
  finalService: string;
  otpServiceName: string;
  mode: AuthoriseMode;
  confirmation?: ConfirmationMessage;
};

export type AuthoriseResult = {
  success: boolean;
  header: string;
  message: string;
  details: DetailsItem[];
  raw: FinalMessage;
};

type Options = { onCompleted?: (result: AuthoriseResult) => void };

export const useAuthorisedAction = ({ onCompleted }: Options = {}) => {
  const dispatch = useAppDispatch();
  const { execute, loading } = useAsync();
  const config = useRef<AuthoriseConfig | null>(null);

  const [step, setStep] = useState<AuthoriseStep>("idle");
  const [confirmation, setConfirmation] = useState<ConfirmationMessage | null>(null);
  const [otpMessage, setOtpMessage] = useState<string>();
  const [remainingAttempts, setRemainingAttempts] = useState<number>();
  const [result, setResult] = useState<AuthoriseResult | null>(null);

  const sessionEnded = (code?: string) => {
    if (code === "03" || code === "04") {
      dispatch(resetAll());
      return true;
    }
    return false;
  };

  const sendOtp = useCallback(
    async (resend: boolean) => {
      const c = config.current;
      if (!c) return false;
      const res = await execute(() => generateOtp({ serviceName: c.otpServiceName, resendOtp: resend ? "Y" : "N" }));
      if (!res) return false;
      if (!res.success) {
        sessionEnded(res.code);
        return false;
      }
      setOtpMessage(res.data.Message.otpScreenMsg);
      if (resend) {
        setRemainingAttempts(res.data.Message.remainingAttempts);
        getConfig().toast.success(res.data.Message.otpScreenMsg);
      }
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [execute],
  );

  const complete = useCallback(
    async (otp: string) => {
      const c = config.current;
      if (!c) return false;
      const res = await execute(() => authoriseAction(c.finalService, { otp }));
      if (!res) return false;
      if (!res.success) {
        sessionEnded(res.code);
        return false; // OTP screens clear the field and let the user retry
      }
      const m = res.data.Message;
      const r: AuthoriseResult = {
        success: res.data.Status !== "06",
        header: m.finalScreenHeader,
        message: m.finalScreenMsg,
        details: m.Details ?? [],
        raw: m,
      };
      setResult(r);
      setStep("result");
      onCompleted?.(r);
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [execute, onCompleted],
  );

  /** Start after the feature's *_CONF / *_CONFIRMATION call succeeded */
  const begin = useCallback(
    async (c: AuthoriseConfig) => {
      config.current = c;
      setConfirmation(c.confirmation ?? null);
      setResult(null);
      setRemainingAttempts(undefined);
      if (c.mode === "OTP_ONLY") {
        const ok = await sendOtp(false);
        if (ok) setStep("otp");
        return ok;
      }
      setStep("confirm");
      return true;
    },
    [sendOtp],
  );

  /** "Confirm" on the details screen */
  const confirm = useCallback(async () => {
    const c = config.current;
    if (!c) return false;
    if (c.mode === "CONFIRM_ONLY") return complete("");
    const ok = await sendOtp(false);
    if (ok) setStep("otp");
    return ok;
  }, [complete, sendOtp]);

  const submitOtp = useCallback((otp: string) => complete(otp), [complete]);
  const resendOtp = useCallback(() => sendOtp(true), [sendOtp]);

  /** Back one step: OTP → details (or form for OTP_ONLY), details → form */
  const back = useCallback(() => {
    if (step === "otp" && config.current?.mode !== "OTP_ONLY") setStep("confirm");
    else setStep("idle");
  }, [step]);

  const reset = useCallback(() => {
    config.current = null;
    setStep("idle");
    setConfirmation(null);
    setResult(null);
    setOtpMessage(undefined);
    setRemainingAttempts(undefined);
  }, []);

  return {
    step,
    loading,
    confirmation,
    otpMessage,
    remainingAttempts,
    resendDisabled: remainingAttempts !== undefined && remainingAttempts < 1,
    result,
    begin,
    confirm,
    submitOtp,
    resendOtp,
    back,
    reset,
  };
};

export type AuthorisedAction = ReturnType<typeof useAuthorisedAction>;
