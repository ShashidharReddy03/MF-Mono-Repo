import type { RawServerResponse } from "./common.types";

export type Account = {
  accountName: string;
  accountType: string;
  alias: string;
  currency: string;
  accountNumber: string;
  accountStatus: string;
};

export type OtherBank = { bankCode: string; bankName: string };

export type AuthMeta = {
  CIF: string;
  CNAME: string;
  CMOBILE: string;
  customerEmail: string;
  LastLogin: string;
  CustomerStatus: string;
  otpTimer: string;
  displaySecurityQuestion: "Y" | "N";
  PwdTobeChanged: "Y" | "N";
  PwdTobeChangedExpired: "Y" | "N";
  /** Transaction limits (My Profile → Change limits) */
  globalLimit?: string;
  isLimitToggleOff?: "Y" | "N";
  limitsCurrency?: string;
  currentAppLimit?: string;
  /** IB username shown on My Profile */
  userName?: string;
};

/** What the login OTP call returns inside DBData.Message (subset we use) */
export type LoginDBData = AuthMeta & {
  sourceAccountList: Account[];
  primaryAccountDetails: Account[];
  BeneficiaryBankName: OtherBank[];
};

export type LoginForm = { username: string; password: string; captcha: string };
export type LoginPayload = { UID: string; PWD: string };
export type LoginOTPPayload = LoginPayload & { otp: string; FetchDBData: "Y" };

/* ---------- MPIN (mobile) ---------- */
export type MpinLoginForm = { username: string; mpin: string };
export type MpinLoginPayload = { UID: string; MPIN: string };

export type LoginResponse = RawServerResponse & { SessionID: string };
export type LoginOtpResponse = RawServerResponse;
