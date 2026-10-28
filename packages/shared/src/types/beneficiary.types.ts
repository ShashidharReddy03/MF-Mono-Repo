import type { BaseResponse, DetailsItem, SuccessMessage } from "./common.types";

/** "SCU" = same bank (internal), "LOCAL" = other local bank */
export type BeneficiaryType = "SCU" | "LOCAL";

export type Beneficiary = {
  benid: string;
  Type: BeneficiaryType;
  beneficiaryName: string;
  beneficiaryAcno: string;
  maskedAcno: string;
  beneficiaryMobile: string;
  beneficiaryEmail?: string;
  beneficiaryBank?: string;
  "Alias Name": string;
};

export type BeneficiaryListResponse = BaseResponse<Beneficiary[]>;
export type DeleteBeneficiaryPayload = { benId: string };
export type DeleteBeneficiaryResponse = BaseResponse<string>;

export type VerifyAccountPayload = { benAccount: string };
export type VerifiedAccount = {
  "Beneficiary Name": string;
  "Account Number": string;
  "Mobile Number": string;
  Currency: string;
  /** e.g. "Shares Membership Account" — decides the multiples-of-100 rule */
  AccType?: string;
};
export type VerifyAccountResponse = BaseResponse<VerifiedAccount>;

export type SameBankBeneficiaryForm = {
  accNum: string;
  beneName: string;
  mobileNumber: string;
  email?: string;
  alias: string;
};

export type OtherBankBeneficiaryForm = {
  accNum: string;
  beneBank: string;
  benFirstName: string;
  benLastName: string;
  mobileNumber: string;
  email?: string;
  alias: string;
};

export type SameBankBeneficiaryPayload = {
  benAccount: string;
  benAlias: string;
  benMobile: string;
  benEmail: string;
  benName: string;
};

export type OtherBankBeneficiaryPayload = {
  benAccount: string;
  benAlias: string;
  benMobile: string;
  benEmail: string;
  benFirstName: string;
  benLastName: string;
  bankCode: string;
};

export type BeneficiaryConfirmation = {
  confScreenHeader: string;
  confScreenMsg: string;
  otpScreenHeader: string;
  otpScreenMsg: string;
  Details: DetailsItem[];
};
export type BeneficiaryConfirmationResponse = BaseResponse<BeneficiaryConfirmation>;
export type BeneficiarySuccessResponse = BaseResponse<SuccessMessage>;

export type AddBeneficiaryStep = "form" | "confirm" | "success";
