# Mobile device security (MF Bank)

Native checks live in **`apps/mobile/modules/device-security`** — a local Expo Module with an
Android (Kotlin) and iOS (Swift) implementation behind one TypeScript API. The Android side is a port
of Miracle_MB's `SecurityPlugin.java`. SSL pinning is a build-time config plugin
(**`apps/mobile/plugins/withSslPinning.js`**).

> Needs a **development or release build** (`npm run android`, `npm run ios`, EAS). In **Expo Go** the
> native module is absent: checks report "not available" and never block.

## Checklist → implementation

| Checklist item | Android | iOS | Default action |
|---|---|---|---|
| Frida detection (`isFridaDetected`) | `/proc/self/maps` scan (as Miracle) + frida-server port 27042/27043 | loaded dylibs + same ports | **block** |
| Root / jailbreak (`isDeviceJailbroken`) | `test-keys` (as Miracle) + su / Magisk files + `which su` | jailbreak files, sandbox write test, hooking libraries | **block** |
| `getHardware` / `isSimulator` | same emulator heuristics as Miracle | `targetEnvironment(simulator)` | **block** |
| Debugger attached (`isUsbDebuggingEnabled.debuggerConnected`) | `Debug.isDebuggerConnected()` | `sysctl` P_TRACED | **block** |
| Proxy (`isProxy`) | `http.proxyHost` (as Miracle) + Wi-Fi proxy | system proxy settings (HTTP/HTTPS/PAC) | **block** |
| `isScreenBeingCapturedOrShared` | extra presentation display (cast/mirroring) | `UIScreen.isCaptured` | **block** (hides app until it stops) |
| `isAppInstalledFromAppStore` | Play Store / Amazon installer | App Store receipt (TestFlight = not store) | warn (block with `EXPO_PUBLIC_REQUIRE_STORE_INSTALL=true`) |
| `isVPNConnected` | `TRANSPORT_VPN` | VPN tunnel interfaces | warn |
| `isUsbDebuggingEnabled` (ADB) | `ADB_ENABLED` | n/a | warn |
| `isDeviceInDeveloperMode` | developer options | debugger attached (no public API) | warn |
| `isConnectedToLaptop` / USB connection | USB data connection to a computer *(fixed — Miracle's `getDeviceList()` never saw a laptop)* | not available (no public API) | warn |
| `isSimCardNotAvailable` | `TelephonyManager.simState` (no permission) | no active radio technology | warn |
| `getSimData` | `SubscriptionManager` (needs `READ_PHONE_STATE`) | not available on current iOS | report (`EXPO_PUBLIC_COLLECT_SIM_DATA`) |
| `currentSystemVersion` | release, SDK, security patch | iOS version | report |
| Screenshot | blocked by `FLAG_SECURE` (expo-screen-capture, release builds) | blocked / blanked (expo-screen-capture) | — |
| SSL pinning | `network_security_config.xml` pin-set | `NSPinnedDomains` | build time |

Actions are set in **`apps/mobile/src/core/security/securityPolicy.ts`** (`block` / `warn` / `report`).

## Behaviour

- Checks run at start-up, whenever the app returns to the foreground, and live checks (screen capture,
  debugger, proxy, VPN, USB) every 5 seconds.
- **block** → full-screen "This device isn't secure" with *Check again*. Any block other than screen
  capture also **ends the session**. Screen capture only hides the app until recording/sharing stops.
- **warn** → one "Security notice" per finding per app run.
- Every request already carries `IsEmulator` and `isRootedApp` from these results. With
  `EXPO_PUBLIC_SEND_SECURITY_FIELDS=true` it also carries `IsJailbroken`, `IsFridaDetected`,
  `IsDebuggerAttached`, `IsProxy`, `IsVPN`, `IsUsbDebugging`, `IsDeveloperMode`,
  `IsConnectedToLaptop`, `IsSimAbsent`, `IsFromStore`, `OSVersion`, `SecurityPatch`, `DeviceModel`
  (Y / N / U = unavailable) — agree these names with the backend first.
- `EXPO_PUBLIC_DEVICE_SECURITY`: `enforce` (default in release builds), `report` (default in development,
  so emulators and USB debugging keep working), `off`.

## SSL pinning — adding the real pins

Pins are **public-key (SPKI) SHA-256 hashes**, in `apps/mobile/app.json` → `plugins` → `withSslPinning`.
While they are placeholders the plugin skips pinning and prints a warning.

1. Get the bank's certificate chain:
   ```bash
   openssl s_client -connect ibuat.scu.sc:8081 -servername ibuat.scu.sc -showcerts </dev/null
   ```
2. Save the **intermediate CA** certificate (2nd block) to `ca.pem`, then hash its public key:
   ```bash
   openssl x509 -in ca.pem -pubkey -noout | openssl pkey -pubin -outform der \
     | openssl dgst -sha256 -binary | openssl enc -base64
   ```
3. Put that value plus a **backup pin** (the CA's other/next key, from the bank's PKI team) in `pins`.
   With `"iosPinType": "ca"` pins are CA keys (survive server-certificate renewals); use `"leaf"` only
   if the bank pins the server key itself.
4. Rebuild: `npx expo prebuild --clean` then `npm run android` / `npm run ios`.
5. Set `expiration` so an expired pin-set falls back to normal validation instead of locking users out.
   Add the production domain as a second entry before go-live.

## Testing on a device / emulator (Android)

| Check | How to trigger |
|---|---|
| Emulator | run on the Android emulator with `EXPO_PUBLIC_DEVICE_SECURITY=enforce` |
| USB debugging / developer options / laptop | enable Developer options + USB debugging, plug into a PC |
| Proxy | `adb shell settings put global http_proxy 10.0.2.2:8888` (undo: `:0`) |
| VPN | connect any VPN app |
| Screen sharing | cast the screen |
| Not from store | install the APK with `adb install` |

## Limits

All on-device checks can be bypassed by an attacker who fully controls a rooted device. Back them with
**server-side** attestation (Google Play Integrity / Apple App Attest) verified by the backend.

---

## Update — full 34-control checklist (Android, iOS, Web)

The complete status per control and platform is in **`docs/MF_Bank_Security_Checklist.xlsx`**
(sheets: *Mobile & Web (34)*, *Web Security*, *Summary*). This section supersedes the table above.

New in this update:

| Area | What | Where |
|---|---|---|
| Native checks | device lock, secondary profile / environment, code injection, unsecured Wi-Fi, signing certificate, app integrity, risky & remote-access apps, device admins, accessibility services, keyboard, call state | `modules/device-security` (Kotlin + Swift) |
| Overlay / tapjacking | touches through overlays dropped; overlays hidden on Android 12+ | `enableOverlayProtection` (always on) |
| Build hardening | StrandHogg task affinity, R8 obfuscation + shrinking, `<queries>` / URL schemes for app detection | `plugins/withAndroidHardening.js`, `security-lists.json` |
| Responses | `isolate` (end session, clear app data, lock for the run, report) / `block` / `warn` / `report` | `src/core/security/securityPolicy.ts` |
| OTA config | `minAppVersion` (forced update), policy overrides, extra blacklist | `EXPO_PUBLIC_SECURITY_CONFIG_URL`, shared `remoteSecurityConfig.ts` |
| Threat alerts | every finding (mobile) and framing / CSP violations (web) sent to the backend | shared `threatReporter.ts`, `*_THREAT_REPORT_SERVICE` |
| Both platforms | login cooldown after 3 failures; absolute session limit (30 min) | shared `useLogin`, `useSessionLimit` |
| Web | frame-busting, HTTPS-only guard, CSP violation reporting, stricter CSP, Nginx / IIS security headers, `npm run security:audit` | `apps/web/src/core/security`, `apps/web/deploy/` |

Remote config example (host as static JSON on a pinned bank domain):

```json
{
  "minAppVersion": "1.2.0",
  "policy": { "vpn": "block", "remoteAccessApp": "block" },
  "blacklist": { "android": ["com.example.fakebank"], "ios": ["examplescheme"] },
  "updateUrl": { "android": "https://play.google.com/store/apps/details?id=com.mfbank.mobile", "ios": "https://apps.apple.com/app/id0000000000" }
}
```

Settings to fill before production (`apps/mobile/.env`, `apps/web/.env.*`):
`EXPO_PUBLIC_ANDROID_SIGNING_SHA256` (APK locking), real SSL pins in `app.json`,
`EXPO_PUBLIC_SECURITY_CONFIG_URL`, `EXPO_PUBLIC_THREAT_REPORT_SERVICE` / `VITE_THREAT_REPORT_SERVICE`.
