import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Account, AuthMeta, LoginDBData, OtherBank } from "../../types";
import type { Beneficiary } from "../../types";

export type AuthState = {
  meta: AuthMeta | null;
  sourceAccountList: Account[];
  primaryAccountDetails: Account[];
  otherBankList: OtherBank[];
  beneficiaryList: Beneficiary[];
};

const initialState: AuthState = {
  meta: null,
  sourceAccountList: [],
  primaryAccountDetails: [],
  otherBankList: [],
  beneficiaryList: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Hydrate everything returned by the login OTP call */
    setLoginData: (s, { payload: m }: PayloadAction<LoginDBData>) => {
      s.meta = {
        CIF: m.CIF,
        CNAME: m.CNAME,
        CMOBILE: m.CMOBILE,
        customerEmail: m.customerEmail,
        LastLogin: m.LastLogin,
        CustomerStatus: m.CustomerStatus,
        otpTimer: m.otpTimer,
        displaySecurityQuestion: m.displaySecurityQuestion,
        PwdTobeChanged: m.PwdTobeChanged,
        PwdTobeChangedExpired: m.PwdTobeChangedExpired,
        globalLimit: m.globalLimit,
        isLimitToggleOff: m.isLimitToggleOff,
        limitsCurrency: m.limitsCurrency,
        currentAppLimit: m.currentAppLimit,
        userName: m.userName,
      };
      s.sourceAccountList = m.sourceAccountList ?? [];
      s.primaryAccountDetails = m.primaryAccountDetails ?? [];
      s.otherBankList = m.BeneficiaryBankName ?? [];
    },
    setBeneficiaryList: (s, a: PayloadAction<Beneficiary[]>) => {
      s.beneficiaryList = a.payload;
    },
    /** After CHANGE_LIMITS_FINAL succeeds (demo: setCurrentAppLimit / setLimitToggleOff) */
    updateLimits: (s, a: PayloadAction<{ currentAppLimit?: string; isLimitToggleOff?: "Y" | "N" }>) => {
      if (!s.meta) return;
      if (a.payload.currentAppLimit !== undefined) s.meta.currentAppLimit = a.payload.currentAppLimit;
      if (a.payload.isLimitToggleOff !== undefined) s.meta.isLimitToggleOff = a.payload.isLimitToggleOff;
    },
    clearAuth: () => initialState,
  },
});

export const { setLoginData, setBeneficiaryList, updateLimits, clearAuth } = authSlice.actions;
export default authSlice.reducer;
