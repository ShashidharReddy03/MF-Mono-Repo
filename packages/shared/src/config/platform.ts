/**
 * Platform configuration.
 *
 * The shared package never reads `import.meta.env` (Vite) or
 * `process.env.EXPO_PUBLIC_*` (Expo) directly. Each app calls
 * `configureShared()` once at boot and injects:
 *   - environment values (API URL, RSA key, request identifiers)
 *   - platform adapters (toast, secure random, session-expired handler)
 *
 * This is what lets the exact same API/security/business code run on
 * web and on iOS/Android.
 */

export type ToastAdapter = {
  success: (message: string) => void;
  error: (message: string) => void;
  info?: (message: string) => void;
};

export type SharedConfig = {
  /** Full backend endpoint (processibsrequest.jsp) */
  apiUrl: string;
  /** Base64 SPKI (X.509) RSA public key, same value the demo used */
  rsaPublicKey: string;
  /** When true, requests are answered by the in-memory mock server */
  useMock: boolean;
  /** Enables prod-only behaviours (log suppression, etc.) */
  isProduction: boolean;
  platform: "web" | "ios" | "android";

  /** Static request identifiers expected by the backend */
  reqSource: string;
  reqSourceId: string;
  reqLK: string;
  reqApiVersion: string;
  langCode: string;
  /** Device signals sent on every request */
  device: {
    isEmulator: "Y" | "N";
    isRooted: boolean;
    ipAddress: string;
    bluetooth: string;
    /**
     * Extra device-security results (mobile), e.g. { IsVPN: "N", IsFridaDetected: "N" }.
     * Sent with every request only when non-empty — agree the field names with the backend first.
     */
    securityFields?: Record<string, string>;
  };

  toast: ToastAdapter;
  /** Cryptographically secure random bytes (WebCrypto / expo-crypto) */
  getRandomBytes: (length: number) => Uint8Array;
  /** Called after the store is wiped because the server killed the session */
  onSessionExpired?: (message?: string) => void;
  /** Inactivity timeout for authenticated users */
  inactivityTimeoutMs: number;
  /** Absolute session limit: logged out after this long, active or not (0 = off) */
  absoluteSessionMs: number;
  /**
   * Service code that receives security events (threats found, CSP violations, framing).
   * Leave empty until the backend provides one — events are then only logged in development.
   */
  threatReportService?: string;
};

export type SharedConfigInput = Partial<SharedConfig> &
  Pick<SharedConfig, "apiUrl" | "rsaPublicKey" | "platform" | "toast">;

const defaultRandomBytes = (length: number): Uint8Array => {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (!c?.getRandomValues) {
    throw new Error(
      "No secure random source. Pass getRandomBytes to configureShared().",
    );
  }
  return c.getRandomValues(new Uint8Array(length));
};

let current: SharedConfig | null = null;

export const configureShared = (input: SharedConfigInput): SharedConfig => {
  current = {
    useMock: false,
    isProduction: false,
    reqSource: "INETBSTATIC",
    reqSourceId: "",
    reqLK: "",
    reqApiVersion: "1.2",
    langCode: "en_US",
    device: {
      isEmulator: "N",
      isRooted: false,
      ipAddress: "0.0.0.0",
      bluetooth: "00:00:00:00:00:00",
    },
    getRandomBytes: defaultRandomBytes,
    inactivityTimeoutMs: 5 * 60 * 1000,
    absoluteSessionMs: 30 * 60 * 1000,
    ...input,
  };
  if (langOverride) current.langCode = langOverride;
  return current;
};

export const getConfig = (): SharedConfig => {
  if (!current) {
    throw new Error(
      "@mf-bank/shared is not configured. Call configureShared() before rendering the app.",
    );
  }
  return current;
};

export const isConfigured = () => current !== null;

/** Device checks finish after start-up (and re-run on resume) — update what requests carry */
export const updateDeviceInfo = (patch: Partial<SharedConfig["device"]>) => {
  if (current) current.device = { ...current.device, ...patch };
};

/** Updated by changeLanguage(); sent as `langcode` on every request */
let langOverride: string | null = null;
export const setLangCode = (code: string) => {
  langOverride = code;
  if (current) current.langCode = code;
};
export const getLangCode = () => langOverride ?? current?.langCode ?? "en_US";
