import { useCallback, useMemo, useState } from "react";
import { verifyBeneficiaryAccount } from "../api/services/beneficiary.api";
import {
  initiateOtherBankTransfer,
  initiateOwnTransfer,
  initiateSameBankTransfer,
  TRANSFER_FLOW,
} from "../api/services/transfer.api";
import { t } from "../i18n";
import type {
  ConfirmationResponse,
  OtherBankTransferForm,
  OtherBankTransferPayload,
  OwnTransferForm,
  SameBankTransferForm,
  SameBankTransferPayload,
  TransferKind,
  VerifiedAccount,
} from "../types";
import type { ValidateResponse } from "../api/responseValidator";
import { maskAccount } from "../utils/format";
import { isSharesAccount } from "../utils/validators";
import { useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { useAuthorisedAction } from "./useAuthorisedAction";
import { useBeneficiaries } from "./useBeneficiaries";

/** Field length rules from MF-React-SCU (NarrationField / purpose input) */
export const TRANSFER_TEXT_MIN = 10;
export const TRANSFER_TEXT_MAX = 50;
export const DEFAULT_COUNTRY_CODE = "+248";

export const TRANSFER_KIND_LABEL: Record<TransferKind, string> = {
  get OWN() { return t("Own account"); },
  get SCU() { return t("MF Bank account"); },
  get LOCAL() { return t("Other bank"); },
};

/** SEFT cut-off notice shown before other-bank transfers (demo: PaymentModeConfirmModal) */
export const SEFT_NOTICE = {
  get title() { return t("SEFT cut-off time"); },
  get message() { return t("Transfers sent after 3:00 PM are processed on the next working day."); },
  get warning() { return t("Please check all details. Transfers cannot be reversed once processed."); },
};

const amountPayload = (v: string) => v.replace(/,/g, "").trim();
const mobileWithCode = (m = "") => (m.trim().startsWith("+") ? m.trim() : `${DEFAULT_COUNTRY_CODE} ${m.trim()}`);

/**
 * Fund transfer — Own account / MF Bank account / Other bank.
 * Same services, payloads and rules as MF-React-SCU; the confirm → OTP → result
 * part is the shared useAuthorisedAction engine.
 */
export const useFundTransfer = () => {
  const accounts = useAppSelector((s) => s.auth.sourceAccountList);
  const otherBanks = useAppSelector((s) => s.auth.otherBankList);
  const { list: beneficiaries, refresh: refreshBeneficiaries } = useBeneficiaries(true);
  const { execute, loading } = useAsync();
  const { execute: execVerify, loading: verifying } = useAsync();

  // demo TransferRedirect: own-account transfer only makes sense with 2+ accounts
  const kinds: TransferKind[] = accounts.length > 1 ? ["OWN", "SCU", "LOCAL"] : ["SCU", "LOCAL"];
  const [kind, setKindState] = useState<TransferKind>(kinds[0]);
  const [verified, setVerified] = useState<VerifiedAccount | null>(null);
  /** last submitted values, so "Edit details" returns to a filled form (demo: setFormData) */
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [savedBeneficiaryRequested, setSaveRequested] = useState(false);

  const action = useAuthorisedAction({
    onCompleted: (r) => {
      if (r.success && savedBeneficiaryRequested) void refreshBeneficiaries();
    },
  });

  const setKind = useCallback(
    (k: TransferKind) => {
      setKindState(k);
      setVerified(null);
      setDraft({});
      action.reset();
    },
    [action],
  );

  /* ---------- options for the selects ---------- */

  const accountOptions = useMemo(
    () =>
      accounts.map((a) => ({
        value: a.accountNumber,
        label: `${a.alias || a.accountName} · ${maskAccount(a.accountNumber)}`,
      })),
    [accounts],
  );
  /** "To account" for own transfers: every account except the one paying */
  const toAccountOptions = useCallback(
    (from?: string) => accountOptions.filter((o) => o.value !== from),
    [accountOptions],
  );
  const currencyOf = useCallback(
    (accountNumber?: string) => accounts.find((a) => a.accountNumber === accountNumber)?.currency ?? "SCR",
    [accounts],
  );
  const accountTypeOf = useCallback(
    (accountNumber?: string) => accounts.find((a) => a.accountNumber === accountNumber)?.accountType,
    [accounts],
  );
  const beneficiaryOptions = useMemo(
    () =>
      beneficiaries
        .filter((b) => b.Type === (kind === "LOCAL" ? "LOCAL" : "SCU"))
        .map((b) => ({ value: b.benid, label: `${b["Alias Name"] || b.beneficiaryName} · ${b.maskedAcno}` })),
    [beneficiaries, kind],
  );
  const beneficiaryById = useCallback((id?: string) => beneficiaries.find((b) => b.benid === id), [beneficiaries]);
  const bankOptions = useMemo(() => otherBanks.map((b) => ({ value: b.bankCode, label: b.bankName })), [otherBanks]);

  /** Is the multiples-of-100 rule active for the destination account? */
  const needsMultipleOf100 = useCallback(
    (destinationAccountType?: string) => isSharesAccount(destinationAccountType),
    [],
  );

  /* ---------- same-bank account lookup ---------- */

  const verifyAccount = useCallback(
    async (accNum: string) => {
      setVerified(null);
      const res = await execVerify(() => verifyBeneficiaryAccount({ benAccount: accNum.trim() }));
      if (!res?.success) return null;
      setVerified(res.data.Message);
      return res.data.Message;
    },
    [execVerify],
  );

  /* ---------- submit (→ *_CONFIRMATION, then the shared engine) ---------- */

  const start = useCallback(
    async (k: TransferKind, call: () => Promise<ValidateResponse<ConfirmationResponse>>, values: object) => {
      const res = await execute(call);
      if (!res?.success) return false;
      setDraft({ ...values });
      const flow = TRANSFER_FLOW[k];
      return action.begin({ ...flow, confirmation: res.data.Message });
    },
    [action, execute],
  );

  const submitOwn = useCallback(
    (v: OwnTransferForm) =>
      start(
        "OWN",
        () =>
          initiateOwnTransfer({
            sourceAccount: v.fromAccount,
            toAccount: v.toAccount,
            amount: amountPayload(v.amount),
            currency: currencyOf(v.fromAccount),
            remarks: v.narration.trim(),
          }),
        v,
      ),
    [currencyOf, start],
  );

  const submitSameBank = useCallback(
    (v: SameBankTransferForm) => {
      const common = {
        sourceAccount: v.fromAccount,
        currency: currencyOf(v.fromAccount),
        amount: amountPayload(v.amount),
        narration: v.narration.trim(),
        purposeOfTransfer: v.purpose.trim(),
      };
      let payload: SameBankTransferPayload;
      if (v.transferType === "OnceOff") {
        if (!verified) return Promise.resolve(false);
        payload = {
          ...common,
          toAccount: (v.accNum ?? "").trim(),
          benName: verified["Beneficiary Name"],
          benMobile: mobileWithCode(v.mobileNumber),
          benEmail: v.email?.trim() ?? "",
          saveBen: v.saveBene ? "Y" : "N",
          benAlias: v.alias?.trim(),
        };
      } else {
        const b = beneficiaryById(v.bene);
        payload = {
          ...common,
          benId: v.bene ?? "",
          benName: b?.beneficiaryName ?? "",
          benMobile: mobileWithCode(b?.beneficiaryMobile),
          benEmail: b?.beneficiaryEmail ?? "",
          saveBen: "N",
        };
      }
      setSaveRequested(v.transferType === "OnceOff" && !!v.saveBene);
      return start("SCU", () => initiateSameBankTransfer(payload), v);
    },
    [beneficiaryById, currencyOf, start, verified],
  );

  const submitOtherBank = useCallback(
    (v: OtherBankTransferForm) => {
      const common = {
        sourceAccount: v.fromAccount,
        amount: amountPayload(v.amount),
        narration: v.narration.trim(),
        purposeOfTransfer: v.purpose.trim(),
      };
      const payload: OtherBankTransferPayload =
        v.transferType === "OnceOff"
          ? {
              ...common,
              bankCode: v.beneBank ?? "",
              toAccount: (v.accNum ?? "").trim(),
              benFirstName: (v.benFirstName ?? "").trim(),
              benLastName: (v.benLastName ?? "").trim(),
              benMobile: `${DEFAULT_COUNTRY_CODE}${(v.mobileNumber ?? "").trim()}`,
              benEmail: v.email?.trim() ?? "",
              saveBen: v.saveBene ? "Y" : "N",
              benAlias: v.alias?.trim(),
            }
          : { ...common, benId: v.bene ?? "", saveBen: "N" };
      setSaveRequested(v.transferType === "OnceOff" && !!v.saveBene);
      return start("LOCAL", () => initiateOtherBankTransfer(payload), v);
    },
    [start],
  );

  /** "New transfer" from the result screen */
  const newTransfer = useCallback(() => {
    setDraft({});
    setVerified(null);
    action.reset();
  }, [action]);

  return {
    kinds,
    kind,
    setKind,
    draft,
    accountOptions,
    toAccountOptions,
    currencyOf,
    accountTypeOf,
    beneficiaryOptions,
    beneficiaryById,
    bankOptions,
    needsMultipleOf100,
    verified,
    clearVerified: () => setVerified(null),
    verifyAccount,
    verifying,
    loading,
    submitOwn,
    submitSameBank,
    submitOtherBank,
    newTransfer,
    /** confirm → OTP → result state and actions */
    action,
  };
};
export type FundTransfer = ReturnType<typeof useFundTransfer>;
