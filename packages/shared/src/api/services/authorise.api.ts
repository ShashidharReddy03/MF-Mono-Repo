import { apiRequest } from "../requestConfig";
import type { FinalResponse, OTPPayload } from "../../types";

/**
 * Generic final step for any confirmed action (transfers, profile changes).
 * Demo: confirmTransfer(payload, service). otp is "" for CONFIRM_ONLY flows.
 */
export const authoriseAction = (service: string, p: OTPPayload) => apiRequest<FinalResponse, OTPPayload>(service, p);
