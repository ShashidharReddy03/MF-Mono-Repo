import { apiRequest } from "../requestConfig";
import type {
  RecoveryMode,
  RecoveryNewPasswordPayload,
  RecoveryOtpMessageResponse,
  RecoveryOtpPayload,
  RecoveryQuestionsResponse,
  RecoverySecQuesPayload,
  RecoverySuccessResponse,
  RecoveryUserDetailsPayload,
} from "../../types";

/** Service codes per flow — the flows are otherwise identical */
const SERVICES: Record<RecoveryMode, { details: string; questions: string; otp: string }> = {
  password: {
    details: "PRELOGIN_EMAIL_VALIDATION",
    questions: "PRELOGIN_SQANS_VALIDATION",
    otp: "PRELOGIN_OTP_VALIDATION",
  },
  username: {
    details: "FORGOTUSERNAME_EMAIL",
    questions: "FORGOTUSERNAME_QA",
    otp: "FORGOTUSERNAME_OTP",
  },
};

export const recoveryValidateUser = (mode: RecoveryMode, p: RecoveryUserDetailsPayload) =>
  apiRequest<RecoveryQuestionsResponse, RecoveryUserDetailsPayload>(SERVICES[mode].details, p);

export const recoveryValidateAnswers = (mode: RecoveryMode, p: RecoverySecQuesPayload) =>
  apiRequest<RecoveryOtpMessageResponse, RecoverySecQuesPayload>(SERVICES[mode].questions, p);

export const recoveryValidateOtp = (mode: RecoveryMode, p: RecoveryOtpPayload) =>
  apiRequest<RecoverySuccessResponse, RecoveryOtpPayload>(SERVICES[mode].otp, p);

export const recoverySetPassword = (p: RecoveryNewPasswordPayload) =>
  apiRequest<RecoverySuccessResponse, RecoveryNewPasswordPayload>("PRELOGIN_FORGOTPASSWORD_VALIDATION", p);
