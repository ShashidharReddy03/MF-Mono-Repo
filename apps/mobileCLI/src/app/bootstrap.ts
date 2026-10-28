/**
 * Wires @mf-bank/shared to React Native CLI. Imported FIRST from index.ts.
 */
import { Platform } from "react-native";
import "react-native-get-random-values";
import DeviceInfo from "react-native-device-info";
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
    isEmulator: DeviceInfo.isEmulatorSync() ? "Y" : "N",
    isRooted: false,
    ipAddress: "0.0.0.0",
    bluetooth: "00:00:00:00:00:00",
  },
  toast,
  getRandomBytes: (n) => {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return bytes;
  },
  inactivityTimeoutMs: env.idleTimeoutMs,
  absoluteSessionMs: env.sessionMaxMs,
  threatReportService: env.threatReportService,
  onSessionExpired: undefined,
});

initMobileLanguageSync();
