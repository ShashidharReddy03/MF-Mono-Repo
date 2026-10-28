/** Typed access to EXPO_PUBLIC_* (inlined by Metro at build time) */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  rsaPublicKey: process.env.EXPO_PUBLIC_RSA_PUBLIC_KEY ?? "",
  useMock: process.env.EXPO_PUBLIC_USE_MOCK === "true",
  reqSource: process.env.EXPO_PUBLIC_REQ_SOURCE || "INETBSTATIC",
  reqSourceId: process.env.EXPO_PUBLIC_REQ_SOURCE_ID ?? "",
  reqLK: process.env.EXPO_PUBLIC_REQ_LK ?? "",
  idleTimeoutMs: (Number(process.env.EXPO_PUBLIC_IDLE_TIMEOUT_MIN) || 5) * 60_000,
  sessionMaxMs: (process.env.EXPO_PUBLIC_SESSION_MAX_MIN === "0" ? 0 : Number(process.env.EXPO_PUBLIC_SESSION_MAX_MIN) || 30) * 60_000,
  threatReportService: process.env.EXPO_PUBLIC_THREAT_REPORT_SERVICE || undefined,
  isProduction: !__DEV__,
};
