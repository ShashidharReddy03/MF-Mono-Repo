import type { BaseResponse, DetailsItem, SuccessMessage } from "./common.types";

export type RegistrationType = "New" | "Migration";

export type CustomerVerificationForm = {
  registrationType: RegistrationType;
  accNum: string;
  mobileNumber?: string;
  email?: string;
  username?: string;
  cif?: string;
  terms: boolean;
};

export type RValidateCustomerDetailsPayload =
  | { registrationType: "New"; accountNumber: string; mobileNumber: string; email: string }
  | { registrationType: "Migration"; accountNumber: string; legacyUserName?: string; RegcifNumber: string };

export type CustomerVerificationMessage = {
  confScreenHeader: string;
  confScreenMsg: string;
  otpTimer: string;
  Details: DetailsItem[];
};
export type CustomerVerificationResponse = BaseResponse<CustomerVerificationMessage>;

export type RegistrationOTPPayload = { accountNumber: string; otp: string };

/** Each list item is "<id>-<question text>" */
export type SecurityQuestionLists = { SQ1: string[]; SQ2: string[]; SQ3: string[]; SQ4: string[] };
export type RegOTPResponse = BaseResponse<SecurityQuestionLists>;

export type SecurityQuestionAnswer = { questionId: string; answer: string };
export type SecurityQuestionsForm = {
  ques1: string; answer1: string;
  ques2: string; answer2: string;
  ques3: string; answer3: string;
  ques4: string; answer4: string;
};
export type RSecurityQuesPayload = { accountNumber: string; securityQuestions: SecurityQuestionAnswer[] };

export type ValidateUsernamePayload = { username: string };

export type RegSetPasswordForm = { regUsername: string; password: string; confPassword: string };
export type RSetPasswordPayload = {
  accountNumber: string;
  username: string;
  password: string;
  confirmPassword: string;
};

/** Mobile: last registration step creates an MPIN instead of a password */
export type RegSetMpinForm = { regUsername: string; mpin: string; confMpin: string };
export type RSetMpinPayload = {
  accountNumber: string;
  username: string;
  mpin: string;
  confirmMpin: string;
};

export type RegistrationSuccessResponse = BaseResponse<SuccessMessage>;
export type SimpleStringResponse = BaseResponse<string>;
