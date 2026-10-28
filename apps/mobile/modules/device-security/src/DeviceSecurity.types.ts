export type HardwareInfo = {
  hardware: string;
  model: string;
  manufacturer: string;
  product: string;
  isEmulator: boolean;
};

export type UsbDebuggingInfo = { adbEnabled: boolean; devOptions: boolean; debuggerConnected: boolean };

export type LaptopConnection = {
  connected: boolean;
  usbDataConnected: boolean;
  usbCharging: boolean;
  adbEnabled: boolean;
  /** false on iOS: no public API */
  available?: boolean;
};

export type SimInfo = { slot: number; carrier: string; number: string };

export type InstallSource = { isFromStore: boolean; storeId: string };

export type SystemVersion = {
  platform: "android" | "ios";
  release: string;
  sdkInt: number;
  securityPatch: string;
  incremental: string;
  codename: string;
};

export type AppInfo = { packageName: string; isSystem: boolean };

export type CallState = { voiceCall: boolean; internetCall: boolean };

export type AppIntegrity = {
  packageName: string;
  debuggable: boolean;
  /** Android: SHA-256 of the signing certificate(s), "AB:CD:…" */
  signingCertificates: string[];
  installer: string;
  /** iOS only */
  hasProvisioningProfile?: boolean;
  binaryEncrypted?: boolean | null;
};

/** Native surface (Kotlin: DeviceSecurityModule.kt, Swift: DeviceSecurityModule.swift) */
export type DeviceSecurityNative = {
  getHardware(): HardwareInfo;
  isSimulator(): boolean;
  isDeviceJailbroken(): boolean;
  isFridaDetected(): Promise<boolean>;
  isVPNConnected(): boolean;
  isProxy(): boolean;
  isUsbDebuggingEnabled(): UsbDebuggingInfo;
  isDeviceInDeveloperMode(): boolean;
  isConnectedToLaptop(): LaptopConnection;
  isSimCardNotAvailable(): boolean;
  hasPhonePermission(): boolean;
  getSimData(): SimInfo[];
  isAppInstalledFromAppStore(): InstallSource;
  currentSystemVersion(): SystemVersion;
  isScreenBeingCapturedOrShared(): boolean;

  isDeviceSecure(): boolean;
  isSecondaryProfile(): boolean;
  isSecondaryEnvironment(): boolean;
  isCodeInjected(): boolean;
  /** null = not on Wi-Fi / unknown / not available (iOS) */
  isUnsecuredWifi(): boolean | null;
  getSigningCertificates(): string[];
  getAppIntegrity(): AppIntegrity;
  /** Android: package names · iOS: URL schemes — returns the ones present */
  getInstalledPackages(packagesOrSchemes: string[]): string[];
  getDeviceAdmins(): AppInfo[];
  getAccessibilityServices(): AppInfo[];
  getKeyboard(): AppInfo;
  /** Android: tapjacking + overlay protection on the current activity */
  enableOverlayProtection(): boolean;
  getCallState(): CallState;
};
