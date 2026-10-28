import {
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_RSA_PUBLIC_KEY,
  EXPO_PUBLIC_USE_MOCK,
  EXPO_PUBLIC_REQ_SOURCE,
  EXPO_PUBLIC_REQ_SOURCE_ID,
  EXPO_PUBLIC_REQ_LK,
  EXPO_PUBLIC_IDLE_TIMEOUT_MIN,
  EXPO_PUBLIC_SESSION_MAX_MIN,
  EXPO_PUBLIC_THREAT_REPORT_SERVICE,
} from "@env";

/** Same keys as the Expo app so `.env` files can be copied across. */
export const env = {
  apiUrl: EXPO_PUBLIC_API_URL ?? "",
  rsaPublicKey: EXPO_PUBLIC_RSA_PUBLIC_KEY ?? "",
  useMock: EXPO_PUBLIC_USE_MOCK === "true",
  reqSource: EXPO_PUBLIC_REQ_SOURCE || "INETBSTATIC",
  reqSourceId: EXPO_PUBLIC_REQ_SOURCE_ID ?? "",
  reqLK: EXPO_PUBLIC_REQ_LK ?? "",
  idleTimeoutMs: (Number(EXPO_PUBLIC_IDLE_TIMEOUT_MIN) || 5) * 60_000,
  sessionMaxMs: (EXPO_PUBLIC_SESSION_MAX_MIN === "0" ? 0 : Number(EXPO_PUBLIC_SESSION_MAX_MIN) || 30) * 60_000,
  threatReportService: EXPO_PUBLIC_THREAT_REPORT_SERVICE || undefined,
  isProduction: !__DEV__,
};
