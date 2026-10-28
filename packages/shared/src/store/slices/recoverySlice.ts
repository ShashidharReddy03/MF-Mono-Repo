import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RecoveryMode, RecoveryQuestion, SuccessMessage } from "../../types";

/** Steps: 0 details → 1 questions → 2 otp → 3 new password (pwd only) → last success */
export const RECOVERY_STEPS: Record<RecoveryMode, readonly string[]> = {
  password: ["Details", "Security", "OTP", "Password", "Done"],
  username: ["Details", "Security", "OTP", "Done"],
};

type RecoveryState = {
  mode: RecoveryMode;
  step: number;
  cif: string;
  email: string;
  questions: RecoveryQuestion[];
  otpMessage: string;
  otpTimer: number;
  success: SuccessMessage | null;
};

const initialState: RecoveryState = {
  mode: "password",
  step: 0,
  cif: "",
  email: "",
  questions: [],
  otpMessage: "",
  otpTimer: 60,
  success: null,
};

const recoverySlice = createSlice({
  name: "recovery",
  initialState,
  reducers: {
    startRecovery: (_s, a: PayloadAction<RecoveryMode>) => ({ ...initialState, mode: a.payload }),
    setRecoveryStep: (s, a: PayloadAction<number>) => {
      s.step = a.payload;
    },
    setRecoveryUser: (
      s,
      a: PayloadAction<{ cif: string; email: string; questions: RecoveryQuestion[] }>,
    ) => {
      Object.assign(s, a.payload);
      s.step = 1;
    },
    setRecoveryOtp: (s, a: PayloadAction<{ message: string; otpTimer: number }>) => {
      s.otpMessage = a.payload.message;
      s.otpTimer = a.payload.otpTimer;
      s.step = 2;
    },
    setRecoverySuccess: (s, a: PayloadAction<SuccessMessage>) => {
      s.success = a.payload;
      s.step = RECOVERY_STEPS[s.mode].length - 1;
    },
  },
});

export const {
  startRecovery,
  setRecoveryStep,
  setRecoveryUser,
  setRecoveryOtp,
  setRecoverySuccess,
} = recoverySlice.actions;
export default recoverySlice.reducer;
