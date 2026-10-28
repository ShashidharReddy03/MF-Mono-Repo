/**
 * Runs every native check (modules/device-security) and turns the results into
 * findings with the policy action attached. Each check is isolated: one failing
 * check never stops the others. null = not available on this platform / build.
 */
import { Platform } from "react-native";
import Constants from "expo-constants";
import { isVersionLower, type RemoteSecurityConfig } from "@mf-bank/shared";
import {
  DeviceSecurity,
  isDeviceSecurityAvailable,
  requestPhonePermission,
  type AppIntegrity,
  type HardwareInfo,
  type InstallSource,
  type LaptopConnection,
  type SimInfo,
  type SystemVersion,
  type UsbDebuggingInfo,
} from "../../../modules/device-security";
import {
  BLACKLISTED_APPS,
  REMOTE_ACCESS_APPS,
  TRUSTED_ACCESSIBILITY,
  TRUSTED_DEVICE_ADMINS,
  TRUSTED_KEYBOARDS,
} from "./securityLists";
import { COLLECT_SIM_DATA, DEFAULT_POLICY, EXPECTED_SIGNING_CERTS, type CheckAction, type CheckId } from "./securityPolicy";

export type Finding = {
  id: CheckId;
  detected: boolean | null;
  action: CheckAction;
  /** e.g. the names of the risky apps found — sent with threat reports */
  detail?: string;
};

export type DeviceReport = {
  available: boolean;
  findings: Finding[];
  info: {
    hardware?: HardwareInfo;
    system?: SystemVersion;
    installSource?: InstallSource;
    integrity?: AppIntegrity;
    usb?: UsbDebuggingInfo;
    laptop?: LaptopConnection;
    sims?: SimInfo[];
  };
  checkedAt: number;
};

const safe = <T,>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

const platformKey = Platform.OS === "ios" ? "ios" : "android";
export const appVersion = () => Constants.expoConfig?.version ?? "0.0.0";
const expectedAppId = () =>
  Platform.OS === "ios" ? Constants.expoConfig?.ios?.bundleIdentifier : Constants.expoConfig?.android?.package;

/** Policy = defaults, overridden by the remote (OTA) config */
export const effectivePolicy = (remote: RemoteSecurityConfig | null) => {
  const merged = { ...DEFAULT_POLICY };
  Object.entries(remote?.policy ?? {}).forEach(([id, action]) => {
    if (id in merged) merged[id as CheckId] = action;
  });
  return merged;
};

let simPermissionAsked = false;

/** quick = only the checks that can change while the app is open */
export const runDeviceChecks = async (quick: boolean, remote: RemoteSecurityConfig | null): Promise<DeviceReport> => {
  const policy = effectivePolicy(remote);
  const results: Partial<Record<CheckId, boolean | null>> = {};
  const details: Partial<Record<CheckId, string>> = {};
  const info: DeviceReport["info"] = {};

  // #30 minimum version works even without the native module
  if (remote?.minAppVersion) results.outdatedApp = isVersionLower(appVersion(), remote.minAppVersion);

  if (!isDeviceSecurityAvailable()) {
    const findings = (Object.keys(results) as CheckId[]).map((id) => ({ id, detected: results[id] ?? null, action: policy[id] }));
    return { available: false, findings, info, checkedAt: Date.now() };
  }
  const ds = DeviceSecurity();

  /* ---------- live checks (every few seconds) ---------- */
  const usb = safe(() => ds.isUsbDebuggingEnabled());
  const laptop = safe(() => ds.isConnectedToLaptop());
  const calls = safe(() => ds.getCallState());
  Object.assign(results, {
    screenCaptured: safe(() => ds.isScreenBeingCapturedOrShared()),
    debugger: usb ? usb.debuggerConnected : null,
    proxy: safe(() => ds.isProxy()),
    vpn: safe(() => ds.isVPNConnected()),
    unsecuredWifi: safe(() => ds.isUnsecuredWifi()),
    voiceCall: calls ? calls.voiceCall : null,
    internetCall: calls && Platform.OS === "android" ? calls.internetCall : null, // iOS reports both as one call
  });
  info.usb = usb ?? undefined;
  info.laptop = laptop ?? undefined;

  if (!quick) {
    /* ---------- device ---------- */
    Object.assign(results, {
      deviceNotSecure: (() => {
        const v = safe(() => ds.isDeviceSecure());
        return v === null ? null : !v;
      })(),
      simulator: safe(() => ds.isSimulator()),
      secondaryProfile: Platform.OS === "android" ? safe(() => ds.isSecondaryProfile()) : null,
      secondaryEnvironment: Platform.OS === "android" ? safe(() => ds.isSecondaryEnvironment()) : null,
      codeInjection: safe(() => ds.isCodeInjected()),
      jailbroken: safe(() => ds.isDeviceJailbroken()),
      frida: await ds.isFridaDetected().catch(() => null),
    });

    /* ---------- installation source, signature, tampering ---------- */
    const install = safe(() => ds.isAppInstalledFromAppStore());
    const integrity = safe(() => ds.getAppIntegrity());
    info.installSource = install ?? undefined;
    info.integrity = integrity ?? undefined;
    results.notFromStore = install ? !install.isFromStore : null;

    if (Platform.OS === "android" && integrity && EXPECTED_SIGNING_CERTS.length) {
      const certs = integrity.signingCertificates.map((c) => c.toUpperCase());
      results.signatureMismatch = certs.length === 0 || !certs.every((c) => EXPECTED_SIGNING_CERTS.includes(c));
      if (results.signatureMismatch) details.signatureMismatch = certs.join(",");
    } else {
      results.signatureMismatch = null; // iOS: guaranteed by Apple code signing · Android: no expected certificate configured
    }

    if (integrity) {
      const wrongId = !!expectedAppId() && integrity.packageName !== expectedAppId();
      const debuggableRelease = !__DEV__ && Platform.OS === "android" && integrity.debuggable;
      const decryptedStoreBinary =
        !__DEV__ && Platform.OS === "ios" && install?.storeId === "appstore" && integrity.binaryEncrypted === false;
      results.appTampered = wrongId || debuggableRelease || decryptedStoreBinary;
      if (results.appTampered) {
        details.appTampered = [wrongId && "app-id", debuggableRelease && "debuggable", decryptedStoreBinary && "decrypted"]
          .filter(Boolean)
          .join(",");
      }
    }

    /* ---------- risky apps ---------- */
    const blacklist = [...BLACKLISTED_APPS[platformKey], ...(remote?.blacklist?.[platformKey] ?? [])];
    const foundRisky = safe(() => ds.getInstalledPackages(blacklist));
    results.blacklistedApps = foundRisky ? foundRisky.length > 0 : null;
    if (foundRisky?.length) details.blacklistedApps = foundRisky.join(",");

    const foundRemote = safe(() => ds.getInstalledPackages(REMOTE_ACCESS_APPS[platformKey]));
    results.remoteAccessApp = foundRemote ? foundRemote.length > 0 : null;
    if (foundRemote?.length) details.remoteAccessApp = foundRemote.join(",");

    /* ---------- anti-malware (Android) ---------- */
    if (Platform.OS === "android") {
      const admins = safe(() => ds.getDeviceAdmins());
      const badAdmins = admins?.filter((a) => !a.isSystem && !TRUSTED_DEVICE_ADMINS.includes(a.packageName)) ?? null;
      results.unknownDeviceAdmin = badAdmins ? badAdmins.length > 0 : null;
      if (badAdmins?.length) details.unknownDeviceAdmin = badAdmins.map((a) => a.packageName).join(",");

      const a11y = safe(() => ds.getAccessibilityServices());
      const badA11y = a11y?.filter((a) => !a.isSystem && !TRUSTED_ACCESSIBILITY.includes(a.packageName)) ?? null;
      results.untrustedAccessibility = badA11y ? badA11y.length > 0 : null;
      if (badA11y?.length) details.untrustedAccessibility = badA11y.map((a) => a.packageName).join(",");

      const kb = safe(() => ds.getKeyboard());
      results.thirdPartyKeyboard = kb?.packageName ? !kb.isSystem && !TRUSTED_KEYBOARDS.includes(kb.packageName) : null;
      if (results.thirdPartyKeyboard) details.thirdPartyKeyboard = kb?.packageName;
    }

    info.hardware = safe(() => ds.getHardware()) ?? undefined;
    info.system = safe(() => ds.currentSystemVersion()) ?? undefined;

    if (COLLECT_SIM_DATA) {
      if (!ds.hasPhonePermission() && !simPermissionAsked) {
        simPermissionAsked = true;
        await requestPhonePermission().catch(() => false);
      }
      if (ds.hasPhonePermission()) info.sims = safe(() => ds.getSimData()) ?? undefined;
    }
  }

  const findings = (Object.keys(results) as CheckId[]).map((id) => ({
    id,
    detected: results[id] ?? null,
    action: policy[id],
    detail: details[id],
  }));
  return { available: true, findings, info, checkedAt: Date.now() };
};

/** Request fields for the backend (only sent when EXPO_PUBLIC_SEND_SECURITY_FIELDS is on) */
export const toSecurityFields = (r: DeviceReport): Record<string, string> => {
  const yn = (id: CheckId) => {
    const f = r.findings.find((x) => x.id === id);
    return f?.detected == null ? "U" : f.detected ? "Y" : "N";
  };
  return {
    IsJailbroken: yn("jailbroken"),
    IsFridaDetected: yn("frida"),
    IsCodeInjected: yn("codeInjection"),
    IsTampered: yn("appTampered"),
    IsSignatureMismatch: yn("signatureMismatch"),
    IsDebuggerAttached: yn("debugger"),
    IsProxy: yn("proxy"),
    IsVPN: yn("vpn"),
    IsUnsecuredWifi: yn("unsecuredWifi"),
    IsSecondaryProfile: yn("secondaryProfile"),
    IsClonedApp: yn("secondaryEnvironment"),
    IsDeviceLockSet: (() => {
      const v = yn("deviceNotSecure");
      return v === "U" ? "U" : v === "Y" ? "N" : "Y";
    })(),
    HasRiskyApps: yn("blacklistedApps"),
    HasRemoteAccessApp: yn("remoteAccessApp"),
    HasUntrustedAccessibility: yn("untrustedAccessibility"),
    HasUnknownDeviceAdmin: yn("unknownDeviceAdmin"),
    IsThirdPartyKeyboard: yn("thirdPartyKeyboard"),
    IsOnCall: yn("voiceCall") === "Y" || yn("internetCall") === "Y" ? "Y" : "N",
    IsScreenShared: yn("screenCaptured"),
    IsFromStore: r.info.installSource ? (r.info.installSource.isFromStore ? "Y" : "N") : "U",
    AppVersion: appVersion(),
    OSVersion: r.info.system ? `${r.info.system.platform} ${r.info.system.release}` : "",
    SecurityPatch: r.info.system?.securityPatch ?? "",
    DeviceModel: r.info.hardware?.hardware ?? "",
  };
};
