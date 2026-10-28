/** My Profile contract — ported from MF-React-SCU (profile.types.ts) */
import type { BaseResponse } from "./common.types";
import type { SecurityQuestionAnswer, SecurityQuestionLists } from "./registration.types";

export type ChangePasswordForm = { currentPassword: string; password: string; confPassword: string };
export type ChangePasswordPayload = { oldPassword: string; newPassword: string; confirmPassword: string };

export type ChangeLimitsForm = { amount: string; serviceOff: boolean };
export type ChangeLimitsPayload = { newLimit: string; isToggleOff: "Y" | "N" };

export type ChangeSecurityQuestionsPayload = {
  securityQuestions: SecurityQuestionAnswer[];
  forceChange: "Y" | "N";
};

export type SecurityQuestionResponse = BaseResponse<SecurityQuestionLists>;
export type SimpleMessageResponse = BaseResponse<string>;

export type LinkedAccount = {
  accountName: string;
  accountType: string;
  currency: string;
  accountNumber: string;
  status: string;
};
export type LinkedAccountsListResponse = BaseResponse<LinkedAccount[]>;
