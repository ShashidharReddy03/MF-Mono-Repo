import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CustomerVerificationMessage,
  RegistrationType,
  SecurityQuestionLists,
  SuccessMessage,
} from "../../types";

export const REGISTRATION_STEPS = [
  "Verify",
  "OTP",
  "Security",
  "Credentials",
  "Done",
] as const;

type RegistrationState = {
  step: number;
  registrationType: RegistrationType;
  accountNumber: string;
  email: string;
  verification: CustomerVerificationMessage | null;
  questionLists: SecurityQuestionLists | null;
  success: SuccessMessage | null;
};

const initialState: RegistrationState = {
  step: 0,
  registrationType: "New",
  accountNumber: "",
  email: "",
  verification: null,
  questionLists: null,
  success: null,
};

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setRegStep: (s, a: PayloadAction<number>) => {
      s.step = a.payload;
    },
    setCustomerVerified: (
      s,
      a: PayloadAction<{
        registrationType: RegistrationType;
        accountNumber: string;
        email: string;
        verification: CustomerVerificationMessage;
      }>,
    ) => {
      Object.assign(s, a.payload);
      s.step = 1;
    },
    setQuestionLists: (s, a: PayloadAction<SecurityQuestionLists>) => {
      s.questionLists = a.payload;
      s.step = 2;
    },
    setRegSuccess: (s, a: PayloadAction<SuccessMessage>) => {
      s.success = a.payload;
      s.step = 4;
    },
    resetRegistration: () => initialState,
  },
});

export const {
  setRegStep,
  setCustomerVerified,
  setQuestionLists,
  setRegSuccess,
  resetRegistration,
} = registrationSlice.actions;
export default registrationSlice.reducer;
