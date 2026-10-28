import { useCallback, useMemo, useState } from "react";
import {
  confirmBeneficiaryOtp,
  fetchBeneficiaryList,
  saveOtherBankBeneficiaryConf,
  saveSameBankBeneficiaryConf,
  verifyBeneficiaryAccount,
} from "../api/services/beneficiary.api";
import { generateOtp } from "../api/services/common.api";
import { getConfig } from "../config/platform";
import { setBeneficiaryList } from "../store/slices/authSlice";
import type {
  AddBeneficiaryStep,
  BeneficiaryConfirmation,
  BeneficiaryType,
  OtherBankBeneficiaryForm,
  SameBankBeneficiaryForm,
  SuccessMessage,
  VerifiedAccount,
} from "../types";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useAsync } from "./useAsync";
import { t } from "../i18n";

/**
 * Add beneficiary (same pattern as the demo's "OTP_ONLY" flow):
 *   form → *_CONF (server validates + sends OTP) → confirm details + OTP → success
 */
export const useAddBeneficiary = () => {
  const dispatch = useAppDispatch();
  const otherBanks = useAppSelector((s) => s.auth.otherBankList);
  const { execute, loading } = useAsync();
  const { execute: execVerify, loading: verifying } = useAsync();

  const [type, setTypeState] = useState<BeneficiaryType>("SCU");
  const [step, setStep] = useState<AddBeneficiaryStep>("form");
  const [verified, setVerified] = useState<VerifiedAccount | null>(null);
  const [confirmation, setConfirmation] = useState<BeneficiaryConfirmation | null>(null);
  const [success, setSuccess] = useState<SuccessMessage | null>(null);

  const reset = useCallback(() => {
    setStep("form");
    setVerified(null);
    setConfirmation(null);
    setSuccess(null);
  }, []);

  const setType = useCallback(
    (t: BeneficiaryType) => {
      setTypeState(t);
      reset();
    },
    [reset],
  );

  /** Same-bank: look up the account holder so the user can't mistype the name */
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

  const submitSameBank = useCallback(
    async (v: SameBankBeneficiaryForm) => {
      if (!verified) {
        getConfig().toast.error(t("Please verify the account number first"));
        return false;
      }
      const res = await execute(() =>
        saveSameBankBeneficiaryConf({
          benAccount: v.accNum.trim(),
          benName: verified["Beneficiary Name"],
          benAlias: v.alias.trim(),
          benMobile: v.mobileNumber,
          benEmail: v.email?.trim() ?? "",
        }),
      );
      if (!res?.success) return false;
      setConfirmation(res.data.Message);
      setStep("confirm");
      return true;
    },
    [execute, verified],
  );

  const submitOtherBank = useCallback(
    async (v: OtherBankBeneficiaryForm) => {
      const res = await execute(() =>
        saveOtherBankBeneficiaryConf({
          benAccount: v.accNum.trim(),
          bankCode: v.beneBank,
          benFirstName: v.benFirstName.trim(),
          benLastName: v.benLastName.trim(),
          benAlias: v.alias.trim(),
          benMobile: v.mobileNumber,
          benEmail: v.email?.trim() ?? "",
        }),
      );
      if (!res?.success) return false;
      setConfirmation(res.data.Message);
      setStep("confirm");
      return true;
    },
    [execute],
  );

  const confirmOtp = useCallback(
    async (otp: string) => {
      const res = await execute(() => confirmBeneficiaryOtp(type, { otp }));
      if (!res?.success) return false;
      setSuccess(res.data.Message);
      setStep("success");
      // keep the cached list in sync
      const list = await execute(() => fetchBeneficiaryList());
      if (list?.success) dispatch(setBeneficiaryList(list.data.Message ?? []));
      return true;
    },
    [dispatch, execute, type],
  );

  const resendOtp = useCallback(async () => {
    const res = await execute(() => generateOtp({ serviceName: "AddBeneficiary", resendOtp: "Y" }));
    if (res?.success) getConfig().toast.success(res.data.Message.otpScreenMsg);
    return !!res?.success;
  }, [execute]);

  const bankOptions = useMemo(
    () => otherBanks.map((b) => ({ label: b.bankName, value: b.bankCode })),
    [otherBanks],
  );

  return {
    type,
    setType,
    step,
    backToForm: () => setStep("form"),
    verified,
    clearVerified: () => setVerified(null),
    confirmation,
    success,
    loading,
    verifying,
    bankOptions,
    verifyAccount,
    submitSameBank,
    submitOtherBank,
    confirmOtp,
    resendOtp,
    reset,
  };
};
