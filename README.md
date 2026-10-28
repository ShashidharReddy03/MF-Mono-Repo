# MF Bank — web + mobile monorepo

Internet banking for **web (React + Vite)** and **mobile (React Native + Expo)**, sharing one
package of API, security, types, state, hooks and business logic.

```
mf-bank/
├── packages/shared/   @mf-bank/shared  – API, encryption, types, Redux store, hooks, validators, mock backend
├── apps/web/          @mf-bank/web     – React 19 · Vite · antd 6 · Tailwind 3.4 · React Router 7
├── apps/mobile/       @mf-bank/mobile  – Expo SDK 57 · React Native 0.86 · @ant-design/react-native · NativeWind 4
└── docs/ARCHITECTURE.md                – code walkthrough + security mapping from the demo
```

Login: **web** = username + password + captcha + OTP; **mobile** = username + 6-digit MPIN.
Registration ends with username + password on web, username + MPIN on mobile.
Both are set in `packages/shared/src/config/login.config.ts`.

Screens on both platforms: Login, Registration, Forgot password,
Forgot username, Dashboard, Statements (mini + full, download), Beneficiaries (list, details,
delete, add with OTP).

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | **≥ 20.19.4** | Required by React Native 0.86 / Vite 8 |
| npm | ≥ 10 | Uses npm **workspaces** (don't mix with yarn/pnpm) |
| Android Studio | latest | Android SDK + an emulator, for `npm run android` |
| Xcode | latest (macOS only) | For `npm run ios` |
| Expo Go / dev build | — | See §4 |

## 2. Install (once, at the repo root)

```bash
npm install
cd apps/mobile && npx expo install --fix && cd ../..
```

`expo install --fix` aligns every native package with the exact versions that Expo SDK 57
expects. The versions in `apps/mobile/package.json` are close but should be corrected this way —
run it after every Expo upgrade too. `npx expo-doctor` (or `npm run doctor -w @mf-bank/mobile`)
double-checks the setup.

## 3. Run the web app

```bash
npm run web                 # http://localhost:5173
```

## 4. Run the mobile app

```bash
npm run mobile              # Expo dev server — press a (Android) / i (iOS)
npm run android             # native debug build on emulator/device (expo run:android)
npm run ios                 # native debug build on simulator (macOS)
```

Expo Go can open the project for quick UI checks, but a **development build**
(`npm run android` / `npm run ios`) is the reliable option: screen-capture blocking and some
native modules behave differently or are unavailable inside Expo Go.

If Metro shows stale styles or can't resolve `@mf-bank/shared` after pulling changes:
`npm run start:clear -w @mf-bank/mobile`.

## 5. Mock mode vs real backend

Both apps start in **mock mode** — an in-memory backend inside `packages/shared/src/api/mock`
that returns the same (already decrypted) response shapes as the real server. No network needed.

| | Demo credentials |
|---|---|
| Username / password | `demo` / `Demo@1234` |
| OTP (every OTP screen) | `123456` |
| Mobile login (username / MPIN) | `demo` / `246810` |
| CIF / email (recovery) | `100200300` / `demo@mfbank.com` |

To hit the real UAT server, switch the flag:

| App | File | Setting |
|---|---|---|
| Web | `apps/web/.env.development` | `VITE_USE_MOCK=false` |
| Mobile | `apps/mobile/.env` | `EXPO_PUBLIC_USE_MOCK=false` |

Restart the dev server after changing env files (mobile: `start:clear`).

**CORS on web:** the browser will block direct calls to `https://ibuat.scu.sc:8081` from
`localhost`. Use the built-in Vite proxy in development:

```env
VITE_API_URL=/api/mfmbs/mbintf/ina/processibsrequest.jsp
VITE_PROXY_TARGET=https://ibuat.scu.sc:8081/
```

Mobile apps are not subject to CORS and call the URL directly.

## 6. Environment variables

| Web (`VITE_*`) | Mobile (`EXPO_PUBLIC_*`) | Purpose |
|---|---|---|
| `USE_MOCK` | `USE_MOCK` | `true` = mock backend |
| `API_URL` | `API_URL` | `processibsrequest.jsp` endpoint |
| `RSA_PUBLIC_KEY` | `RSA_PUBLIC_KEY` | Server public key (base64 SPKI) — wraps per-request keys |
| `REQ_SOURCE`, `REQ_SOURCE_ID`, `REQ_LK` | same | Static identifiers the backend expects |
| `IDLE_TIMEOUT_MIN` | `IDLE_TIMEOUT_MIN` | Minutes before auto-logout |
| `PROXY_TARGET`, `BASE_PATH` | — | Web dev proxy / deploy sub-path |

Web has `.env.development`, `.env.uat`, `.env.production`; mobile has `.env`
(copy `.env.example`). Both toolchains **inline these values into the JS bundle** — only put
values there that are safe to ship to users (a public key is fine; secrets are not).

## 7. Builds

```bash
npm run web:build           # UAT build  → apps/web/dist  (vite --mode uat)
npm run web:build:prod      # production → apps/web/dist  (obfuscated, no source maps, CSP meta)
```

Mobile release builds use EAS (`npm i -g eas-cli`, then in `apps/mobile`: `eas build:configure`,
`eas build -p android` / `-p ios`) or local `npx expo run:android --variant release`.
Production bundles strip `console.*` automatically (babel).

## 8. Other scripts

```bash
npm run typecheck           # tsc across all workspaces
npm run lint -w @mf-bank/web
```

## Languages (English + Arabic)

Both apps support **English** and **Arabic** (right-to-left).

| | Web | Mobile |
|---|---|---|
| Default | Browser language | Phone language |
| Switch | Globe button (login page + header) | Globe button on pre-login screens |
| What happens | Page re-renders in place, layout mirrors | App restarts (needed for RTL), layout mirrors |
| Remembered | `localStorage` (`mfb.lang`) | Device storage (`mfb.lang`) |

Translations live in `packages/shared/src/i18n/locales/ar.json` (English text is the key).
After adding or changing any text, run:

```bash
npm run i18n:check     # lists texts without an Arabic translation (fails CI if any)
```

After pulling this change, install the new packages:

```bash
npm install
cd apps/mobile && npx expo install expo-localization @react-native-async-storage/async-storage @expo-google-fonts/noto-sans-arabic && cd ../..
npm run android        # rebuild the development build once (new native modules)
```

## 9. Before going live — checklist

- [ ] Confirm payload contracts with the backend team for security-question registration and
      add-beneficiary services (modelled on the demo; mobile-specific services never existed there).
- [ ] Ask which `ReqSource` identifies the **mobile** channel (currently the web value `INETBSTATIC`).
- [ ] Add root/jailbreak detection (e.g. `jail-monkey`) → set `device.isRooted` in `apps/mobile/src/app/bootstrap.ts`.
- [ ] Add TLS certificate pinning for mobile (needs a native module / config plugin).
- [ ] Test `@ant-design/react-native` Checkbox/Modal/Toast on real devices (it has limited testing
      on the newest React Native releases).
- [ ] Replace `EXPO_PUBLIC_*` / `VITE_*` per-environment values via your CI, not committed files.

See **docs/ARCHITECTURE.md** for how the code fits together.
