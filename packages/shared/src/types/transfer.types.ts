/**
 * Fund transfer contract — ported from MF-React-SCU (transfer.types.ts).
 * Payloads and service codes are unchanged so the same backend works.
 */
import type { BaseResponse, DetailsItem } from "./common.types";

export type TransferKind = "OWN" | "SCU" | "LOCAL";
export type BeneficiarySource = "OnceOff" | "ViaBene";

/* ---------- forms (what the screens collect) ---------- */

export type OwnTransferForm = {
  fromAccount: string;
  toAccount: string;
  amount: string;
  narration: string;
};

type ExternalTransferBase = {
  transferType: BeneficiarySource;
  fromAccount: string;
  amount: string;
  narration: string;
  purpose: string;
  /** saved beneficiary id (ViaBene) */
  bene?: string;
  /** new beneficiary (OnceOff) */
  accNum?: string;
  mobileNumber?: string;
  email?: string;
  saveBene?: boolean;
  alias?: string;
};

export type SameBankTransferForm = ExternalTransferBase & { beneName?: string };

export type OtherBankTransferForm = ExternalTransferBase & {
  beneBank?: string;
  benFirstName?: string;
  benLastName?: string;
  /** SEFT cut-off notice accepted (demo: PaymentModeConfirmModal) */
  paymentMode?: "SEFT";
};

/* ---------- payloads (what the server receives) ---------- */

export type OwnTransferPayload = {
  sourceAccount: string;
  toAccount: string;
  amount: string;
  currency: string;
  remarks: string;
};

type ExternalCommon = { sourceAccount: string; amount: string; narration: string; purposeOfTransfer: string };

export type SameBankTransferPayload = ExternalCommon & {
  currency: string;
  benName: string;
  benMobile: string;
  benEmail: string;
} & ({ toAccount: string; saveBen: "Y" | "N"; benAlias?: string } | { benId: string; saveBen: "N" });

export type OtherBankTransferPayload = ExternalCommon &
  (
    | {
        toAccount: string;
        bankCode: string;
        benFirstName: string;
        benLastName: string;
        benMobile: string;
        benEmail: string;
        saveBen: "Y" | "N";
        benAlias?: string;
      }
    | { benId: string; saveBen: "N" }
  );

/* ---------- responses ---------- */

export type ConfirmationMessage = {
  confScreenHeader: string;
  confScreenMsg: string;
  otpScreenHeader?: string;
  otpScreenMsg?: string;
  Details: DetailsItem[];
};
export type ConfirmationResponse = BaseResponse<ConfirmationMessage>;

export type FinalMessage = {
  finalScreenHeader: string;
  finalScreenMsg: string;
  refrenceNumber?: string;
  Details?: DetailsItem[];
};
export type FinalResponse = BaseResponse<FinalMessage>;
