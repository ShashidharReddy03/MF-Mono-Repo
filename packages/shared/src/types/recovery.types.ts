import type { BaseResponse, SuccessMessage } from "./common.types";

/** Shared by Forgot Password + Forgot Username */
export type RecoveryMode = "password" | "username";

export type RecoveryUserDetailsForm = { cif: string; email: string };
export type RecoveryUserDetailsPayload = RecoveryUserDetailsForm;

export type RecoveryQuestion = { id: string; question: string };

export type RecoverySecQuesPayload = RecoveryUserDetailsPayload & Record<`QA${number}`, string>;
export type RecoveryOtpPayload = RecoveryUserDetailsPayload & { otp: string };
export type RecoveryNewPasswordPayload = RecoveryUserDetailsPayload & {
  newPass: string;
  reTypeNewPass: string;
};

export type RecoveryOtpMessage = { message: string; otpTimer: string };

export type RecoveryQuestionsResponse = BaseResponse<RecoveryQuestion[]>;
export type RecoveryOtpMessageResponse = BaseResponse<RecoveryOtpMessage>;
export type RecoverySuccessResponse = BaseResponse<SuccessMessage>;
