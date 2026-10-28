import { apiRequest, buildRequest, postRequest } from "../requestConfig";
import type {
  GenerateOTPPayload,
  GenerateOTPResponse,
  PublicResendOTPPayload,
  RawServerResponse,
} from "../../types";

export const generateOtp = (payload: GenerateOTPPayload) =>
  apiRequest<GenerateOTPResponse, GenerateOTPPayload>("OTP_GENERATION", payload);

export const publicResendOtp = (payload: PublicResendOTPPayload) =>
  apiRequest<GenerateOTPResponse, PublicResendOTPPayload>("PRELOGIN_RESEND_OTP", payload);

export const logout = () =>
  postRequest<RawServerResponse>(buildRequest({}, "LOG_OUT_REQ"), { skipSessionCheck: true });
