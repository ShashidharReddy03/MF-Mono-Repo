import { apiRequest } from "../requestConfig";
import type {
  BeneficiaryConfirmationResponse,
  BeneficiaryListResponse,
  BeneficiarySuccessResponse,
  BeneficiaryType,
  DeleteBeneficiaryPayload,
  DeleteBeneficiaryResponse,
  OTPPayload,
  OtherBankBeneficiaryPayload,
  SameBankBeneficiaryPayload,
  VerifyAccountPayload,
  VerifyAccountResponse,
} from "../../types";

export const fetchBeneficiaryList = () =>
  apiRequest<BeneficiaryListResponse>("VIEW_BENEFICIARY_LIST");

export const deleteBeneficiary = (p: DeleteBeneficiaryPayload) =>
  apiRequest<DeleteBeneficiaryResponse, DeleteBeneficiaryPayload>("DELETE_BENEFICIARY", p);

/** Same-bank only: resolves the account holder name */
export const verifyBeneficiaryAccount = (p: VerifyAccountPayload) =>
  apiRequest<VerifyAccountResponse, VerifyAccountPayload>("OTHER_SCU_BEN_DETAILS", p);

export const saveSameBankBeneficiaryConf = (p: SameBankBeneficiaryPayload) =>
  apiRequest<BeneficiaryConfirmationResponse, SameBankBeneficiaryPayload>("SAVE_OTHER_SCU_BEN_CONF", p);

export const saveOtherBankBeneficiaryConf = (p: OtherBankBeneficiaryPayload) =>
  apiRequest<BeneficiaryConfirmationResponse, OtherBankBeneficiaryPayload>("SAVE_LOCAL_BANK_BEN_CONF", p);

/** Final OTP-authorised save. Same pattern as the demo's confirmTransfer(). */
export const BENEFICIARY_OTP_SERVICE: Record<BeneficiaryType, string> = {
  SCU: "SAVE_OTHER_SCU_BEN",
  LOCAL: "SAVE_LOCAL_BANK_BEN",
};

export const confirmBeneficiaryOtp = (type: BeneficiaryType, p: OTPPayload) =>
  apiRequest<BeneficiarySuccessResponse, OTPPayload>(BENEFICIARY_OTP_SERVICE[type], p);
