/** Fund transfer services — same codes as MF-React-SCU transfer.api.ts */
import { apiRequest } from "../requestConfig";
import type {
  ConfirmationResponse,
  OtherBankTransferPayload,
  OwnTransferPayload,
  SameBankTransferPayload,
  TransferKind,
} from "../../types";

export const initiateOwnTransfer = (p: OwnTransferPayload) =>
  apiRequest<ConfirmationResponse, OwnTransferPayload>("FT_OWN_ACCOUNT_CONFIRMATION", p);

export const initiateSameBankTransfer = (p: SameBankTransferPayload) =>
  apiRequest<ConfirmationResponse, SameBankTransferPayload>("FT_OTHER_SCU_CONFIRMATION", p);

export const initiateOtherBankTransfer = (p: OtherBankTransferPayload) =>
  apiRequest<ConfirmationResponse, OtherBankTransferPayload>("FT_LOCAL_BANK_CONFIRMATION", p);

/** Final (authorising) service and OTP service name per transfer type */
export const TRANSFER_FLOW: Record<TransferKind, { finalService: string; otpServiceName: string; mode: "CONFIRM_ONLY" | "CONFIRM_OTP" }> = {
  // own accounts need no OTP (demo: flowMode CONFIRM_ONLY)
  OWN: { finalService: "FT_OWN_ACCOUNT_FINAL", otpServiceName: "To Own Account", mode: "CONFIRM_ONLY" },
  SCU: { finalService: "FT_OTHER_SCU_FINAL", otpServiceName: "To Other SCU Members", mode: "CONFIRM_OTP" },
  LOCAL: { finalService: "FT_LOCAL_BANK_FINAL", otpServiceName: "To Other Local Bank", mode: "CONFIRM_OTP" },
};
