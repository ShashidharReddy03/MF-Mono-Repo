import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Session lives ONLY in memory (never localStorage / AsyncStorage).
 * A page refresh or app kill therefore always forces a fresh login —
 * same security posture as the demo.
 */
type SessionState = { sessionId: string; isOtpVerified: boolean };

const initialState: SessionState = { sessionId: "0", isOtpVerified: false };

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionId: (s, a: PayloadAction<string>) => {
      s.sessionId = a.payload;
    },
    setIsOtpVerified: (s, a: PayloadAction<boolean>) => {
      s.isOtpVerified = a.payload;
    },
    clearSession: () => initialState,
  },
});

export const { setSessionId, setIsOtpVerified, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
