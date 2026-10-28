/** My Profile services — same codes as MF-React-SCU profile.api.ts */
import { apiRequest } from "../requestConfig";
import type {
  ChangeLimitsPayload,
  ChangePasswordPayload,
  ChangeSecurityQuestionsPayload,
  ConfirmationResponse,
  LinkedAccountsListResponse,
  SecurityQuestionResponse,
  SimpleMessageResponse,
} from "../../types";

export const fetchSecurityQuestions = () => apiRequest<SecurityQuestionResponse>("SECURITY_QUESTIONS");

export const changePasswordConf = (p: ChangePasswordPayload) =>
  apiRequest<SimpleMessageResponse, ChangePasswordPayload>("CHANGE_PASSWORD_CONF", p);

export const changeSecurityQuestionsConf = (p: ChangeSecurityQuestionsPayload) =>
  apiRequest<SimpleMessageResponse, ChangeSecurityQuestionsPayload>("CHANGE_SECQUESTIONS_CONF", p);

export const changeLimitsConf = (p: ChangeLimitsPayload) =>
  apiRequest<ConfirmationResponse, ChangeLimitsPayload>("CHANGE_LIMITS_CONF", p);

export const fetchLinkedAccounts = () => apiRequest<LinkedAccountsListResponse>("LINKED_ACCOUNTS_LIST");

/** OTP-authorised final step + OTP service name (demo: flowMode OTP_ONLY) */
export const PROFILE_FLOW = {
  password: { finalService: "SAVE_CHANGE_PASSWORD", otpServiceName: "Change Login Password" },
  securityQuestions: { finalService: "CHANGE_SECQUESTIONS_FINAL", otpServiceName: "Reset Security Questions" },
  limits: { finalService: "CHANGE_LIMITS_FINAL", otpServiceName: "Change Limits" },
} as const;
