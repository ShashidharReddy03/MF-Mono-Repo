import { useCallback, useState } from "react";
import { login, loginOtp } from "../api/services/auth.api";
import { generateOtp } from "../api/services/common.api";
import { getConfig } from "../config/platform";
import { setLoginData } from "../store/slices/authSlice";
import { clearSession, setIsOtpVerified, setSessionId } from "../store/slices/sessionSlice";
import type { LoginDBData, LoginForm, LoginOtpResponse, LoginPayload } from "../types";
import { useAppDispatch } from "./hooks";
import { useAsync } from "./useAsync";
import { useCaptcha } from "./useCaptcha";
import { useLoginCooldown } from "./useLoginCooldown";
import { t } from "../i18n";

export type LoginStep = "credentials" | "otp";

/** DBData → profile, or an error message. Shared by OTP login and MPIN login. */
export const readLoginDBData = (res: LoginOtpResponse): LoginDBData | string => {
  if (!res.DBData) return res.ResultMessage ?? t("Something went wrong!");
  try {
    const parsed = JSON.parse(res.DBData) as { Status: string; Message: LoginDBData | string };
    if (parsed.Status !== "00" || typeof parsed.Message === "string") {
      return typeof parsed.Message === "string" ? parsed.Message : t("Login failed");
    }
    return parsed.Message;
  } catch {
    return t("Something went wrong!");
  }
};

/**
 * Username + password login (login.config method "password" — the web):
 *   1. SERVICE_AUTH (username + password)  → SessionID, OTP sent
 *   2. GENERATE_OTP_FOR_LOGIN (+ otp)      → DBData (profile, accounts)
 * Returns booleans so each platform decides how to navigate.
 */
export const useLogin = () => {
  const dispatch = useAppDispatch();
  const { execute, loading } = useAsync();
  const captcha = useCaptcha();
  const cooldown = useLoginCooldown();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [credentials, setCredentials] = useState<LoginPayload | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>();
  const [otpMessage, setOtpMessage] = useState(
    "We have sent a 6-digit OTP to your registered mobile number and email address.",
  );

  const finish = useCallback(
    (data: LoginDBData) => {
      dispatch(setLoginData(data));
      dispatch(setIsOtpVerified(true));
    },
    [dispatch],
  );

  const submitCredentials = useCallback(
    async (values: LoginForm) => {
      const { toast } = getConfig();
      const wait = cooldown.secondsLeft();
      if (wait > 0) {
        toast.error(t("Too many attempts. Please wait {{n}} seconds.", { n: wait }));
        return false;
      }
      // defence in depth — the form validates this too
      if (!captcha.validate(values.captcha)) {
        toast.error(t("Captcha doesn't match"));
        captcha.refresh();
        return false;
      }
      const payload: LoginPayload = {
        UID: values.username.toLowerCase().trim(),
        PWD: values.password.trim(),
      };
      const res = await execute(() => login(payload));
      captcha.refresh(); // never reuse a captcha
      if (!res) return false;

      if (res.statuscodep === "98" || !res.SessionID || res.SessionID === "0") {
        toast.error(res.ResultMessage ?? t("Login failed. Please try again."));
        cooldown.registerFailure();
        return false;
      }
      cooldown.registerSuccess();
      dispatch(clearSession());
      dispatch(setSessionId(res.SessionID));
      setCredentials(payload);
      setRemainingAttempts(undefined);
      setStep("otp");
      return true;
    },
    [captcha, cooldown, dispatch, execute],
  );

  const verifyOtp = useCallback(
    async (otp: string) => {
      const { toast } = getConfig();
      if (!credentials) return false;
      const res = await execute(() => loginOtp({ ...credentials, otp, FetchDBData: "Y" }));
      if (!res) return false;

      const data = readLoginDBData(res);
      if (typeof data === "string") {
        toast.error(data);
        return false;
      }
      setCredentials(null); // drop the plaintext password from memory ASAP
      finish(data);
      return true;
    },
    [credentials, execute, finish],
  );

  const resendOtp = useCallback(async () => {
    const res = await execute(() => generateOtp({ serviceName: "Login", resendOtp: "Y" }));
    if (res?.success) {
      setRemainingAttempts(res.data.Message.remainingAttempts);
      setOtpMessage(res.data.Message.otpScreenMsg);
      getConfig().toast.success(res.data.Message.otpScreenMsg);
      return true;
    }
    return false;
  }, [execute]);

  const backToCredentials = useCallback(() => {
    dispatch(clearSession());
    setCredentials(null);
    setStep("credentials");
    captcha.refresh();
  }, [captcha, dispatch]);

  return {
    step,
    loading,
    /** > 0 while sign-in is paused after repeated failures */
    lockedSeconds: cooldown.lockedSeconds,
    captcha,
    otpMessage,
    remainingAttempts,
    resendDisabled: remainingAttempts !== undefined && remainingAttempts < 1,
    submitCredentials,
    verifyOtp,
    resendOtp,
    backToCredentials,
  };
};
