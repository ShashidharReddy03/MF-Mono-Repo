import { buildRequest, postRequest } from "../requestConfig";
import type { LoginOTPPayload, LoginOtpResponse, LoginPayload, LoginResponse, MpinLoginPayload } from "../../types";

/** Step 1: credentials → SessionID (OTP is sent by the server) */
export const login = (payload: LoginPayload) =>
  postRequest<LoginResponse>(buildRequest(payload, "SERVICE_AUTH"), { skipSessionCheck: true });

/** Step 2: OTP → DBData (customer profile, accounts…) */
export const loginOtp = (payload: LoginOTPPayload) =>
  postRequest<LoginOtpResponse>(buildRequest(payload, "GENERATE_OTP_FOR_LOGIN"));

/**
 * Mobile login: username + MPIN → SessionID + DBData in one call
 * (same response shape as GENERATE_OTP_FOR_LOGIN). Service code to be confirmed with the backend.
 */
export const mpinLogin = (payload: MpinLoginPayload) =>
  postRequest<LoginOtpResponse>(buildRequest(payload, "MPIN_LOGIN"), { skipSessionCheck: true });
