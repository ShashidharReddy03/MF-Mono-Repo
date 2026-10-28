/**
 * Wires @mf-bank/shared to React Native. Imported FIRST from index.ts,
 * mirroring apps/web/src/app/bootstrap.ts — same shared code, different adapters.
 */
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { configureShared } from "@mf-bank/shared";
import { env } from "@/core/config/env";
import { toast } from "@/shared/ui/base/BaseToast";
import { initMobileLanguageSync } from "@/core/i18n/language";

configureShared({
  platform: Platform.OS === "ios" ? "ios" : "android",
  apiUrl: env.apiUrl,
  rsaPublicKey: env.rsaPublicKey,
  useMock: env.useMock,
  isProduction: env.isProduction,
  reqSource: env.reqSource,
  reqSourceId: env.reqSourceId,
  reqLK: env.reqLK,
  device: {
    // Emulator flag is sent to the backend exactly like the demo's IsEmulator field
    isEmulator: Device.isDevice ? "N" : "Y",
    // Root/jailbreak detection needs a native module (see docs/ARCHITECTURE.md)
    isRooted: false,
    ipAddress: "0.0.0.0",
    bluetooth: "00:00:00:00:00:00",
  },
  toast,
  // Native CSPRNG (SecRandomCopyBytes / SecureRandom) — used for AES/HMAC keys and IVs
  getRandomBytes: (n) => Crypto.getRandomBytes(n),
  inactivityTimeoutMs: env.idleTimeoutMs,
  absoluteSessionMs: env.sessionMaxMs,
  // device-security findings → backend (#31); empty = development log only
  threatReportService: env.threatReportService,
  // Shared already toasts + wipes the store; RootNavigator swaps to the login stack by itself.
  onSessionExpired: undefined,
});

// Device language until the saved choice is loaded in App.tsx
initMobileLanguageSync();
