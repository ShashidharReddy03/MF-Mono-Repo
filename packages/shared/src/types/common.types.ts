/** Envelope used inside ResultMessage for almost every service */
export interface BaseResponse<TMessage = unknown> {
  Status: "00" | "01" | "03" | "04" | "05" | "06";
  Message: TMessage;
}

/** Raw (decrypted) body returned by processibsrequest.jsp */
export type RawServerResponse = {
  ReqRef?: string;
  statuscodep?: string;
  langCode?: string;
  ResultMessage?: string;
  ErrorMessage?: string;
  SessionID?: string;
  DBData?: string;
};

export type DetailsItem = { label: string; value: string };

export type OTPForm = { otp: string };
export type OTPPayload = { otp: string };

export type OTPScreenMessage = {
  otpScreenHeader: string;
  otpScreenMsg: string;
  remainingAttempts?: number;
};

export type GenerateOTPPayload = { serviceName: string; resendOtp: "Y" | "N" };
export type GenerateOTPResponse = BaseResponse<OTPScreenMessage>;

export type PublicResendOTPPayload = { serviceName: string; email: string };

export type SuccessMessage = {
  finalScreenHeader: string;
  finalScreenMsg: string;
  Details?: DetailsItem[];
};

export type SelectOption = { label: string; value: string };
