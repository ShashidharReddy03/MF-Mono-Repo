/**
 * Lists used by the device checks — kept in apps/mobile/security-lists.json so the
 * build plugin (plugins/withAndroidHardening.js) declares exactly the same apps in the
 * Android manifest <queries> and iOS LSApplicationQueriesSchemes.
 * The remote security config can add blacklist entries without an app update.
 */
import lists from "../../../security-lists.json";

/** #29 Remote-desktop / screen-control apps */
export const REMOTE_ACCESS_APPS: { android: string[]; ios: string[] } = lists.remoteAccessApps;
/** #15 Root managers, hooking frameworks, traffic interceptors, app cloners */
export const BLACKLISTED_APPS: { android: string[]; ios: string[] } = lists.blacklistedApps;
/** #20 Non-system accessibility services known to be legitimate */
export const TRUSTED_ACCESSIBILITY: string[] = lists.trustedAccessibility;
/** #21 Non-system keyboards known to be legitimate */
export const TRUSTED_KEYBOARDS: string[] = lists.trustedKeyboards;
/** #19 Device-admin apps that are legitimate (MDM / find-my-device) besides system apps */
export const TRUSTED_DEVICE_ADMINS: string[] = lists.trustedDeviceAdmins;
