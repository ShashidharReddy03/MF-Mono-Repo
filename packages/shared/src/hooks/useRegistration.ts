import { useCallback, useMemo } from "react";
import { publicResendOtp } from "../api/services/common.api";
import {
  checkUsernameAvailability,
  setRegistrationCredentials,
  setRegistrationMpin,
  submitRegSecurityQuestions,
  validateCustomerDetails,
  verifyRegistrationOtp,
} from "../api/services/registration.api";
import { getConfig } from "../config/platform";
import { getLoginConfig } from "../config/login.config";
import {
  REGISTRATION_STEPS,
  resetRegistration,
  setCustomerVerified,
  setQuestionLists,
  setRegStep,
  setRegSuccess,
} from "../store/slices/registrationSlice";
import type {
  CustomerVerificationForm,
  RegSetMpinForm,
  RegSetPasswordForm,
  RValidateCustomerDetailsPayload,
  SecurityQuestionsForm,
} from "../types";
import { toQuestionOptions, toSecurityAnswers } from "../utils/securityQuestions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { t } from "../i18n";

/**
 * Registration wizard:
 *   0 Customer verification → 1 OTP → 2 Security questions → 3 Username + password (web) or MPIN (mobile) → 4 Success
 * Which credential step 3 creates comes from login.config.ts (registrationCredential).
 * State lives in Redux so each step component can be rendered independently.
 */
export const useRegistration = () => {
  const dispatch = useAppDispatch();
  const reg = useAppSelector((s) => s.registration);
  const { execute, loading } = useAsync();

  const verifyCustomer = useCallback(
    async (v: CustomerVerificationForm) => {
      const accountNumber = v.accNum.trim();
      const payload: RValidateCustomerDetailsPayload =
        v.registrationType === "New"
          ? { registrationType: "New", accountNumber, mobileNumber: v.mobileNumber ?? "", email: v.email ?? "" }
          : { registrationType: "Migration", accountNumber, legacyUserName: v.username, RegcifNumber: v.cif ?? "" };

      const res = await execute(() => validateCustomerDetails(payload));
      if (!res?.success) return false;
      dispatch(
        setCustomerVerified({
          registrationType: v.registrationType,
          accountNumber,
          email: v.email ?? "",
          verification: res.data.Message,
        }),
      );
      return true;
    },
    [dispatch, execute],
  );

  const verifyOtp = useCallback(
    async (otp: string) => {
      const res = await execute(() => verifyRegistrationOtp({ accountNumber: reg.accountNumber, otp }));
      if (!res?.success) return false;
      dispatch(setQuestionLists(res.data.Message));
      return true;
    },
    [dispatch, execute, reg.accountNumber],
  );

  const resendOtp = useCallback(async () => {
    const res = await execute(() => publicResendOtp({ serviceName: "Registration", email: reg.email }));
    if (res?.success) getConfig().toast.success(res.data.Message.otpScreenMsg);
    return !!res?.success;
  }, [execute, reg.email]);

  const submitSecurityQuestions = useCallback(
    async (values: SecurityQuestionsForm) => {
      const res = await execute(() =>
        submitRegSecurityQuestions({
          accountNumber: reg.accountNumber,
          securityQuestions: toSecurityAnswers(values),
        }),
      );
      if (!res?.success) return false;
      dispatch(setRegStep(3));
      return true;
    },
    [dispatch, execute, reg.accountNumber],
  );

  /** Returns undefined when available, otherwise the error message */
  const checkUsername = useCallback(
    async (username: string) => {
      const res = await execute(() => checkUsernameAvailability({ username: username.toLowerCase() }));
      if (!res) return "Unable to verify username right now";
      return res.success ? undefined : (res.message ?? "Username is not available");
    },
    [execute],
  );

  const submitCredentials = useCallback(
    async (v: RegSetPasswordForm) => {
      const res = await execute(() =>
        setRegistrationCredentials({
          accountNumber: reg.accountNumber,
          username: v.regUsername.toLowerCase().trim(),
          password: v.password,
          confirmPassword: v.confPassword,
        }),
      );
      if (!res?.success) return false;
      dispatch(setRegSuccess(res.data.Message));
      return true;
    },
    [dispatch, execute, reg.accountNumber],
  );

  /** Mobile (registrationCredential "mpin"): username + MPIN */
  const submitMpinCredentials = useCallback(
    async (v: RegSetMpinForm) => {
      const res = await execute(() =>
        setRegistrationMpin({
          accountNumber: reg.accountNumber,
          username: v.regUsername.toLowerCase().trim(),
          mpin: v.mpin,
          confirmMpin: v.confMpin,
        }),
      );
      if (!res?.success) return false;
      dispatch(setRegSuccess(res.data.Message));
      return true;
    },
    [dispatch, execute, reg.accountNumber],
  );

  const questionOptions = useMemo(() => toQuestionOptions(reg.questionLists), [reg.questionLists]);

  return {
    ...reg,
    steps: REGISTRATION_STEPS.map((s) => t(s)),
    loading,
    questionOptions,
    verifyCustomer,
    verifyOtp,
    resendOtp,
    submitSecurityQuestions,
    checkUsername,
    submitCredentials,
    submitMpinCredentials,
    /** "password" (web) or "mpin" (mobile) — what the credentials step creates */
    credentialType: getLoginConfig().registrationCredential,
    mpinLength: getLoginConfig().mpin?.length ?? 6,
    goToStep: (step: number) => dispatch(setRegStep(step)),
    reset: () => dispatch(resetRegistration()),
  };
};
