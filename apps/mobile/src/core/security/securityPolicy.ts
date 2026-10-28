/**
 * Device-security policy (mobile) — the ONE place that decides what each finding does.
 * Covers the 34-control checklist; see docs/SECURITY_CHECKLIST.md for the full mapping.
 *
 *   isolate → block the app, end the session, clear app data on the device, report to the
 *             server; stays blocked for the rest of this app run (#34 device isolation)
 *   block   → full-screen "device not secure"; clears when the issue goes away
 *   warn    → one alert per app run; the customer may continue
 *   report  → no UI; sent to the server (threat alerts) and logged in development
 *
 * The remote security config (#30) can override any action without an app update.
 */
import { t } from "@mf-bank/shared";

export type CheckId =
  | "deviceNotSecure" // #1 device policy: no screen lock
  | "simulator" // #2 virtual device
  | "secondaryProfile" // #3
  | "codeInjection" // #4 + #17 runtime manipulation
  | "secondaryEnvironment" // #5 app cloners / virtual containers
  | "frida" // #6
  | "jailbroken" // #7
  | "vpn" // #8
  | "notFromStore" // #9 installation source
  | "unsecuredWifi" // #10
  | "proxy" // #12
  | "signatureMismatch" // #13 APK locking (re-signed / repackaged)
  | "debugger" // #14
  | "blacklistedApps" // #15
  | "appTampered" // #18
  | "unknownDeviceAdmin" // #19
  | "untrustedAccessibility" // #20
  | "thirdPartyKeyboard" // #21 keylogger risk
  | "internetCall" // #24
  | "screenCaptured" // #27 screen sharing
  | "voiceCall" // #28
  | "remoteAccessApp" // #29 remote desktop
  | "outdatedApp"; // #30 below the minimum version (OTA config)

export type CheckAction = "isolate" | "block" | "warn" | "report";

const requireStoreInstall = process.env.EXPO_PUBLIC_REQUIRE_STORE_INSTALL === "true";
// the client asked for debugger detection to be optional — warn unless made mandatory
const debuggerAction: CheckAction = process.env.EXPO_PUBLIC_BLOCK_DEBUGGER === "true" ? "block" : "warn";

export const DEFAULT_POLICY: Record<CheckId, CheckAction> = {
  deviceNotSecure: "warn",
  simulator: "block",
  secondaryProfile: "warn",
  codeInjection: "isolate",
  secondaryEnvironment: "block",
  frida: "isolate",
  jailbroken: "isolate",
  vpn: "warn",
  notFromStore: requireStoreInstall ? "block" : "warn",
  unsecuredWifi: "warn",
  proxy: "block",
  signatureMismatch: "isolate",
  debugger: debuggerAction,
  blacklistedApps: "warn",
  appTampered: "isolate",
  unknownDeviceAdmin: "warn",
  untrustedAccessibility: "warn",
  thirdPartyKeyboard: "warn",
  internetCall: "warn",
  screenCaptured: "block",
  voiceCall: "warn",
  remoteAccessApp: "warn",
  outdatedApp: "block",
};

/** Messages shown to the customer */
export const CHECK_TEXT: Record<CheckId, { readonly title: string }> = {
  deviceNotSecure: { get title() { return t("Your phone has no screen lock. Set a PIN, pattern or password."); } },
  simulator: { get title() { return t("The app can't run on an emulator or simulator."); } },
  secondaryProfile: { get title() { return t("The app is running in a secondary user or work profile."); } },
  codeInjection: { get title() { return t("Code has been injected into the app."); } },
  secondaryEnvironment: { get title() { return t("The app is running inside a cloned or virtual app environment."); } },
  frida: { get title() { return t("A tool that can tamper with the app was detected."); } },
  jailbroken: { get title() { return t("This device is rooted or jailbroken."); } },
  vpn: { get title() { return t("A VPN is active."); } },
  notFromStore: { get title() { return t("This app wasn't installed from the official app store."); } },
  unsecuredWifi: { get title() { return t("You're on an unsecured Wi-Fi network."); } },
  proxy: { get title() { return t("A network proxy is active. Your connection may be intercepted."); } },
  signatureMismatch: { get title() { return t("This copy of the app isn't signed by MF Bank."); } },
  debugger: { get title() { return t("A debugger is attached to the app."); } },
  blacklistedApps: { get title() { return t("An app that can compromise your security is installed."); } },
  appTampered: { get title() { return t("The app has been modified."); } },
  unknownDeviceAdmin: { get title() { return t("An unknown app has device administrator rights."); } },
  untrustedAccessibility: { get title() { return t("An app with accessibility access could read your screen."); } },
  thirdPartyKeyboard: { get title() { return t("A third-party keyboard is active. It could record what you type."); } },
  internetCall: { get title() { return t("You're on an internet call. Never share OTPs or passwords during a call."); } },
  screenCaptured: { get title() { return t("Your screen is being recorded or shared."); } },
  voiceCall: { get title() { return t("You're on a phone call. Never share OTPs or passwords during a call."); } },
  remoteAccessApp: { get title() { return t("A remote-control app is installed. Never let anyone control your phone."); } },
  outdatedApp: { get title() { return t("This version of the app is no longer supported. Please update."); } },
};

/**
 * enforce → apply the policy · report → never block or warn (default in development,
 * so emulators and USB debugging work) · off → don't run the checks
 */
export type EnforcementMode = "enforce" | "report" | "off";
const envMode = process.env.EXPO_PUBLIC_DEVICE_SECURITY as EnforcementMode | undefined;
export const ENFORCEMENT: EnforcementMode =
  envMode === "enforce" || envMode === "report" || envMode === "off" ? envMode : __DEV__ ? "report" : "enforce";

export const SEND_SECURITY_FIELDS = process.env.EXPO_PUBLIC_SEND_SECURITY_FIELDS === "true";
export const COLLECT_SIM_DATA = process.env.EXPO_PUBLIC_COLLECT_SIM_DATA === "true";
/** #13 APK locking: SHA-256 fingerprints of the bank's signing certificates (Play App Signing + upload key) */
export const EXPECTED_SIGNING_CERTS = (process.env.EXPO_PUBLIC_ANDROID_SIGNING_SHA256 ?? "")
  .split(",")
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);
/** #30 OTA security config URL (bank-hosted JSON over pinned HTTPS) */
export const SECURITY_CONFIG_URL = process.env.EXPO_PUBLIC_SECURITY_CONFIG_URL ?? "";

/** #33 live monitoring intervals */
export const QUICK_CHECK_MS = 5_000; // screen sharing, calls, debugger, network
export const FULL_CHECK_MS = 60_000; // everything else, plus every return to the foreground
