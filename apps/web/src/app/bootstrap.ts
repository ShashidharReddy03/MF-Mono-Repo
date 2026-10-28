/**
 * Wires @mf-bank/shared to the browser. Imported FIRST in main.tsx.
 */
import { configureShared } from "@mf-bank/shared";
import { toast } from "@/shared/ui/base/BaseToast";
import { initWebLanguage } from "@/core/i18n/language";
import { initWebTheme } from "@/core/i18n/theme";

const env = import.meta.env;

configureShared({
  platform: "web",
  apiUrl: env.VITE_API_URL,
  rsaPublicKey: env.VITE_RSA_PUBLIC_KEY,
  useMock: env.VITE_USE_MOCK === "true",
  isProduction: env.PROD,
  reqSource: env.VITE_REQ_SOURCE || "INETBSTATIC",
  reqSourceId: env.VITE_REQ_SOURCE_ID,
  reqLK: env.VITE_REQ_LK,
  device: {
    isEmulator: "N",
    isRooted: false,
    ipAddress: "0.0.0.0", // server should derive the real IP from the connection
    bluetooth: "00:00:00:00:00:00",
  },
  toast,
  // WebCrypto CSPRNG
  getRandomBytes: (n) => crypto.getRandomValues(new Uint8Array(n)),
  inactivityTimeoutMs: (Number(env.VITE_IDLE_TIMEOUT_MIN) || 5) * 60_000,
  // absolute session limit, logged out even when active (0 = off)
  absoluteSessionMs: (env.VITE_SESSION_MAX_MIN === "0" ? 0 : Number(env.VITE_SESSION_MAX_MIN) || 30) * 60_000,
  // security events (framing, CSP violations) → backend; empty = development log only
  threatReportService: env.VITE_THREAT_REPORT_SERVICE || undefined,
  // RequireAuth reacts to the wiped store and redirects to /login by itself
  onSessionExpired: undefined,
});

// Language: saved choice → browser language → English. Also sets <html lang dir>.
initWebLanguage();

// Colour theme: saved choice → Classic. Writes the CSS variables before the first paint.
initWebTheme();
