import { PermissionsAndroid, Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import type { DeviceSecurityNative } from "./src/DeviceSecurity.types";

export * from "./src/DeviceSecurity.types";

/**
 * null in Expo Go, on web, or before a development build includes the module —
 * callers then treat every check as "not available" instead of crashing.
 */
const native = requireOptionalNativeModule<DeviceSecurityNative>("DeviceSecurity");

export const isDeviceSecurityAvailable = () => native !== null;

/** Throws if the native module is missing; check isDeviceSecurityAvailable() first */
export const DeviceSecurity = (): DeviceSecurityNative => {
  if (!native) throw new Error("DeviceSecurity native module is not available in this build");
  return native;
};

/** READ_PHONE_STATE, needed only for getSimData() on Android */
export const requestPhonePermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};
