# MF Bank — architecture & code walkthrough

## 1. The big idea: one brain, two faces

Everything that is **not** UI lives in `packages/shared` and is imported by both apps as
`@mf-bank/shared` (TypeScript source, no build step — Vite and Metro compile it directly).

```
           ┌──────────────────── @mf-bank/shared ────────────────────┐
           │ config · security · api/services · mock · store · hooks │
           │ types · validators · formatters · dates · captcha       │
           └───────────────▲─────────────────────────▲───────────────┘
                           │ same hooks              │ same hooks
            ┌──────────────┴───────────┐  ┌──────────┴───────────────┐
            │ apps/web                  │  │ apps/mobile               │
            │ antd + Tailwind           │  │ antd-rn + NativeWind      │
            │ React Router              │  │ React Navigation          │
            │ browser security hooks    │  │ device security hooks     │
            └───────────────────────────┘  └───────────────────────────┘
```

A screen on either platform is a thin view over a shared hook. Compare:

- `apps/web/src/modules/private/dashboard/dashboard-page.tsx`
- `apps/mobile/src/modules/private/dashboard/dashboard-screen.tsx`

Both call `useDashboard()` and only differ in markup.

### Platform injection — `configureShared()`

The shared package never reads `import.meta.env` or `process.env`, and never touches `window`.
Each app calls `configureShared()` once, **before anything renders**
(`apps/web/src/app/bootstrap.ts`, `apps/mobile/src/app/bootstrap.ts`) and passes:

| Adapter | Web | Mobile |
|---|---|---|
| env values | `import.meta.env.VITE_*` | `process.env.EXPO_PUBLIC_*` |
| `toast` | antd `message` | antd-rn `Toast` |
| `getRandomBytes` | `crypto.getRandomValues` | `expo-crypto` (native CSPRNG) |
| `device.isEmulator` | `"N"` | `expo-device` |
| `platform` | `"web"` | `"ios"` / `"android"` |

## 2. Folder structure (mirrors the demo)

```
src/
├── app/        bootstrap, App, providers (theme), routes | navigation
├── core/       config (nav, env, fonts), utils (antdRules | rhfRules)
├── shared/
│   ├── hooks/  platform security hooks
│   └── ui/
│       ├── base/        BaseButton, BaseInput, BasePassword, BaseSelect, BaseOTP, BaseModal…
│       ├── form/        FormInput, FormPassword, FormSelect, FormOTP, FormCheckbox…
│       └── components/  OtpVerification, CaptchaField, Stepper, ResultPanel, DetailsList…
└── modules/
    ├── public/   login, registration (R-*.tsx steps), recovery
    └── private/  dashboard (D-*), statement (S-*), beneficiary (B-*)
```

Rules that keep it consistent:

- **Only `Base*` components import the UI library.** Restyling a button = one file.
- **`Form*` = `Base*` + form binding + input sanitising.** Web uses antd `Form.Item`;
  mobile uses react-hook-form `Controller`.
- **Validators are written once** (`packages/shared/src/utils/validators.ts`, return
  `string | undefined`) and adapted: `core/utils/antdRules.ts` (web) and
  `core/utils/rhfRules.ts` (mobile). Same messages everywhere.
- Every keystroke passes through `formatInput(type, value)` — the demo's input sanitisers.

## 3. Shared package map

| Folder | What's inside |
|---|---|
| `config/` | `platform.ts` (configureShared/getConfig), `colors.json` (brand tokens used by antd, antd-rn **and** Tailwind), `theme.ts` |
| `security/` | `encoding.ts` (base64/utf8/hex without DOM APIs), `rsa.ts` (RSA PKCS#1 v1.5 on BigInt), `crypto.service.ts` (demo function names kept: `neasr`, `nefm`, `edfm`), `envelope.ts` (encryptRequest / decryptResponse) |
| `api/` | `client.ts` (axios + interceptors), `requestConfig.ts` (buildRequest / postRequest / apiRequest), `responseValidator.ts`, `handleApiError.ts`, `services/*.api.ts` (one function per ReqService), `mock/` |
| `store/` | Redux Toolkit: `session`, `auth`, `loader`, `registration`, `recovery` + `resetAll()` |
| `hooks/` | `useLogin`, `useLogout`, `useRegistration`, `useRecovery`, `useDashboard`, `useStatements`, `useBeneficiaries`, `useAddBeneficiary`, `useOtpTimer`, `useCaptcha`, `useAsync` |
| `utils/` | validators, inputFormatter, captcha, format (amounts, masking, CSV), date (statement presets, 6-month rule), securityQuestions, idleTimer, logger |
| `types/` | request/response types per feature |

## 4. Life of a request

```
screen → hook (e.g. useLogin) → service (auth.api.ts: login())
       → apiRequest(): buildRequest() adds ReqSourceID, ReqLK, ReqAPIV, ReqSource,
                       device fields, ReqSessionID, ReqService
       → postRequest(): loader++ ─┬─ useMock ? mockServer.handle(request)
                                  └─ axios POST → request interceptor encrypts
                                                → response interceptor decrypts
       → statuscodep "98"? → toast, resetAll(), SessionTimeoutError
       → validateResponse(): parse ResultMessage {Status, Message}
             00/06 → { success: true, data }
             01/03/04 → toast error, success: false
             05 → forced logout
       → loader-- → hook updates state → screen re-renders
```

Hooks return booleans (`true` = step succeeded) so each platform decides how to navigate.

## 5. Security — demo → this project

### Transport encryption (identical wire format to the demo)

| Step | Demo | Here (`security/`) |
|---|---|---|
| Per-request AES key + HMAC key | 16 random chars | same, from secure RNG (`generateRandomAlphaNumeric`) |
| Body | AES-GCM, base64(IV12 ‖ ct ‖ tag) | same — `@noble/ciphers` |
| Integrity | HMAC-SHA512 hex → `nonce` header | same — `@noble/hashes` |
| Key wrapping | JSEncrypt RSA → `ky`, `DhKy`, `nonce` | own RSA PKCS#1 v1.5 (`rsa.ts`), verified 300/300 against Node's private-key decrypt |
| `Content-Type` | `text/plain` | same |
| Response | last 2 chars = ASCII code → N; dynamic key = hex(ky) with first N chars replaced by hex(IV) | same (`decryptResponse`, `buildDynamicKey`) |

Why reimplement: the demo relied on WebCrypto + JSEncrypt, which don't exist in React Native.
The pure-JS versions run identically in the browser and on Hermes, so **one** implementation
serves both apps.

### Session & app protections

| Protection | Demo (web) | Web app | Mobile app |
|---|---|---|---|
| Session storage | memory | Redux only, refresh = logout | Redux only, nothing written to disk |
| Server session timeout (98) | ✓ | shared `postRequest` | shared `postRequest` |
| Inactivity logout | ✓ | `useInactivityLogout` (DOM events + visibilitychange) | `useIdleLogout` (touch capture on root view) |
| Leaving the app | beforeunload warning | `useGlobalUnload` | `useAppSecurity`: background timeout logout |
| Back button | pushState trap | `useBackForwardGuard` (React Router `useBlocker`) | `useHardwareBackLogout` (Android) |
| Screenshots / snooping | disable context menu, F12, selection | `useSecurityRestrictions` (prod) | `expo-screen-capture` + privacy overlay in app switcher |
| Captcha | ✓ (Math.random) | ✓ secure RNG | ✓ secure RNG |
| Virtual keyboard | ✓ | ✓ | OS secure keyboard (`secureTextEntry`) |
| Autofill / clipboard on inputs | — | `autoComplete=off` | `contextMenuHidden`, `importantForAutofill=no` |
| Hidden balances | — | tap to reveal | tap to reveal |
| Logs in production | logger off | logger off | logger off + babel removes `console.*` |
| Code hardening | obfuscator, no sourcemaps | same + CSP meta at build | Hermes bytecode; `allowBackup=false` |

Not yet implemented (see README checklist): root/jailbreak detection, TLS pinning.

## 6. Routing / navigation and the auth gate

**Web** (`app/routes/router.tsx`): `RequireGuest` → `PublicLayout` → public pages;
`RequireAuth` → `PrivateLayout` → private pages. All pages are lazy-loaded.

**Mobile** (`app/navigation/RootNavigator.tsx`): renders `PrivateNavigator` or `PublicNavigator`
based on `selectIsAuthenticated`. Private = native stack (`Tabs`, `AddBeneficiary`) with
bottom tabs Home / Statements / Beneficiaries.

On both, logging out — manually, idle, background, or server timeout — is just
`dispatch(resetAll())`. The auth gate sees the empty session and swaps the tree; no screen
needs its own "redirect to login" logic.

## 7. Feature flows

| Flow | Steps | Hook |
|---|---|---|
| Login | credentials + captcha → `SERVICE_AUTH` → OTP → `GENERATE_OTP_FOR_LOGIN` (profile, accounts) | `useLogin` |
| Registration | customer verification → OTP → 4 security questions → username (availability check) + password → success | `useRegistration` |
| Forgot password | CIF + email → security answers → OTP → new password → success | `useRecovery("password")` |
| Forgot username | CIF + email → security answers → OTP → username shown | `useRecovery("username")` |
| Dashboard | accounts, tap-to-reveal balance (`BALANCE_ENQUIRY`), recent txns (`MINI_STATEMENT`) | `useDashboard` |
| Statements | mini, or full with presets / custom range ≤ 6 months (`FULL_STATEMENT`), download PDF/XLS or CSV fallback | `useStatements` |
| Beneficiaries | list, search, filter, details, delete (`DELETE_BENEFICIARY`) | `useBeneficiaries` |
| Add beneficiary | MF Bank (verify account → name) or other bank → `*_CONF` → confirm + OTP → success | `useAddBeneficiary` |

## 8. Adding a new feature (recipe)

1. `packages/shared/src/types/<feature>.types.ts` — payload/response types.
2. `packages/shared/src/api/services/<feature>.api.ts` — `apiRequest(payload, "SERVICE_CODE")`.
3. Mock response in `api/mock/mockServer.ts` so both apps work offline.
4. `packages/shared/src/hooks/use<Feature>.ts` — state + actions, return booleans.
5. Export from `packages/shared/src/index.ts`.
6. Web page in `apps/web/src/modules/...` + route in `routes.ts`/`router.tsx` (+ `navConfig.ts`).
7. Mobile screen in `apps/mobile/src/modules/...` + register in `app/navigation/*`.

## 9. Comparison with MF-React-SCU (architecture + security)

### Architecture

| Area | MF-React-SCU | MF Bank monorepo |
|---|---|---|
| Platforms | Web only | Web **and** Android/iOS |
| Structure | Single Vite app | npm workspaces: `shared` + `web` + `mobile` |
| API calls (`*.api.ts`) | In each module folder | `packages/shared/src/api/services/` |
| Types (`*.types.ts`) | In each module folder | `packages/shared/src/types/` |
| Redux store/slices | `src/app/store` | `packages/shared/src/store` (used by both apps) |
| Business logic | Mostly inside pages/components | Shared **hooks**; pages only render |
| Validation rules | antd form rules | Plain functions in shared, adapted to antd (web) and react-hook-form (mobile) |
| Env / config | Read directly from `import.meta.env` | Injected at startup via `configureShared()` |
| Development backend | Needs the UAT server | Built-in **mock backend** (`USE_MOCK=true`) |
| UI kit | antd 6 + Tailwind | Web: same. Mobile: @ant-design/react-native + NativeWind |
| Brand colours | Theme/Tailwind config | `colors.json` in shared, used by every UI layer |

### Security

| Area | MF-React-SCU | MF Bank — web | MF Bank — mobile |
|---|---|---|---|
| Where the security code lives | `src/core/services/crypto.service.ts` + `core/api` (web app only) | `packages/shared/src/security` + `api/` (one module for both apps) | same shared module |
| Message encryption (per-request AES-GCM + HMAC-SHA512, RSA-wrapped `ky`/`DhKy`/`nonce`) | ✅ | ✅ identical wire format | ✅ identical wire format |
| Crypto libraries | WebCrypto + JSEncrypt | `@noble/ciphers`, `@noble/hashes`, own RSA (`rsa.ts`) | same (pure JS, runs on Hermes) |
| Random keys / IVs | Browser APIs | `crypto.getRandomValues` (injected) | `expo-crypto` native CSPRNG (injected) |
| Response decryption (dynamic key from `ky` + IV) | ✅ | ✅ | ✅ |
| Server session timeout (`98`) / forced logout (`05`) | ✅ in the web app | ✅ shared `requestConfig` / `responseValidator` | ✅ same shared code |
| Session storage | In memory | In memory (refresh = logout) | In memory (nothing written to the device) |
| Logout path | Handled in the web app | One path: `resetAll()` + `RequireAuth` | One path: `resetAll()` + `RootNavigator` |
| Inactivity logout | ✅ | ✅ `useInactivityLogout` | ✅ `useIdleLogout` + background timeout (`useAppSecurity`) |
| Back navigation guard | pushState trap | React Router `useBlocker` | Android back → confirm logout |
| Leaving the page/app | beforeunload warning | `useGlobalUnload` | Privacy overlay in app switcher |
| Anti-inspection | Blocks right-click, F12, shortcuts, selection | Same (`useSecurityRestrictions`, production) | Screenshots / screen recording blocked (release) |
| Captcha | ✅ `Math.random` | ✅ secure random | ✅ secure random |
| Password entry | Virtual keyboard | Virtual keyboard | OS secure keyboard; no autofill / copy-paste menu |
| Input sanitising | Formatters in web app | Shared `formatInput()` | Same shared `formatInput()` |
| Validation | antd rules | Shared validators → antd adapter | Shared validators → react-hook-form adapter |
| Sensitive display | — | Balances hidden until tapped; masked account numbers | Same |
| Logging in production | Logger off | Shared logger off | Logger off + all `console.*` stripped (Babel) |
| Code hardening | Obfuscator, no source maps | Obfuscator, no source maps, CSP at build | Hermes bytecode; `allowBackup: false` |
| Config / secrets | `import.meta.env` read directly | Injected via `configureShared()`; only public values in `VITE_*` | Same via `EXPO_PUBLIC_*` |
| Mock backend | n/a | In shared — must be off in UAT/prod builds | Same |
| Certificate pinning | n/a | n/a (browser TLS) | ❌ Not yet |
| Root / jailbreak detection | n/a | n/a | ❌ Placeholder only |

### What the architecture change means for security

- **One implementation to audit and patch** — the encryption lives once in `packages/shared/src/security`; fixes reach both apps together and can't drift apart.
- **Same server contract** — the backend receives byte-for-byte the same encrypted format from MF-React-SCU, MF Bank web and MF Bank mobile.
- **Platform protections stay platform-specific** — browser defences in `apps/web/src/shared/hooks`, device defences in `apps/mobile/src/shared/hooks`; neither leaks into `shared`.
- **New risks to manage** — the mock backend must never be enabled outside development; shared security changes need review and testing on both apps; mobile adds certificate pinning and root detection to the go-live checklist.


## 10. Language support (English + Arabic)

**Library:** `i18next`, used directly (no React bindings) from `packages/shared/src/i18n`, so web,
mobile and shared code (hooks, validators, API error toasts) all call the same `t()`.

**Keys are the English text** (`t("Sign in")`). `ar.json` maps them to Arabic; English needs no file.
Placeholders use `{{name}}`: `t("Delete {{name}}", { name })`.

| Piece | Where | How |
|---|---|---|
| Init + switch | `shared/i18n/index.ts` | `initI18n()`, `changeLanguage()`, `getDirection()`, `fieldLabel()` |
| Server language | `config/platform.ts` → `setLangCode()` | Every request's `langcode` follows the UI (`en_US` / `ar_AE` — confirm with backend) |
| Validators | `utils/validators.ts` | Messages translated at validation time; field labels translated via `fieldLabel()` |
| Constants with text | presets, password rules, nav items, beneficiary types | `get label() { return t(…) }` so they follow the active language |
| Dates | dayjs | Arabic month names, **Western digits**; `toApiDate()` always English for the server |
| Amounts / account numbers | `AmountText`, cards | Kept left-to-right (`dir="ltr"` on web, LRM `\u200E` on mobile) |
| Web | `apps/web/src/core/i18n/language.ts` | Sets `<html lang dir>`, antd `ConfigProvider direction/locale`, re-renders router via `key` |
| Mobile | `apps/mobile/src/core/i18n/language.ts` | `I18nManager.forceRTL()` + `reloadAppAsync()` (expo); switch only before login |
| Fonts | web `@fontsource/noto-sans-arabic`; mobile `@expo-google-fonts/noto-sans-arabic` | Montserrat has no Arabic letters |
| Check | `scripts/i18n-check.mjs` | `npm run i18n:check` |

**Not translated by the app:** messages that come from the server (OTP texts, errors, security
questions, confirmation screens) — they follow `langcode`. Mock-mode server messages are English.

**Adding a language:** add `locales/<code>.json`, register it in `SUPPORTED_LANGUAGES`
(code, label in its own script, `dir`, server code) and import it in `initI18n()`.

## 11. Settings: language and theme

| | Web | Mobile |
|---|---|---|
| Where | **Settings** in the sidebar (after login, `/settings`) and the gear icon on pre-login pages (`/preferences`) | **Settings** tab (after login) and the gear icon on pre-login screens |
| Language | Applies instantly, user stays logged in | App restarts (needed for right-to-left); after login the user is warned they will sign in again |
| Theme | Applies instantly | Applies instantly, stays on the same screen |
| Remembered | `localStorage` `mfb.lang` / `mfb.theme` | Device storage `mfb.lang` / `mfb.theme` |

**Themes** live in `packages/shared/src/config/theme.ts`: **Classic** (original navy + green, the default,
from `colors.json`), Ocean, Desert and Royal. Adding a theme = one more palette entry with the same ten tokens.

How colours follow the theme:
- Tailwind / NativeWind classes (`bg-primary`, `text-secondary-dark/50`…) use CSS variables
  (`--c-primary` …) from the shared preset. Web writes them on `<html>`; mobile passes them with
  NativeWind `vars()` on the root view. Classic values are the defaults in each app's global CSS.
- JS code (antd tokens, icon colours) reads `colors.x`, which always returns the active theme's value.
  The router (web) / navigation container (mobile, with its state restored) re-renders on a switch.
- Rule for new code: never hard-code a brand hex value and never read `colors.x` at module load —
  read it during render.

## 12. Fund transfer and My Profile (ported from MF-React-SCU)

Both features live in `packages/shared` and are used unchanged by web and mobile.

**One engine for every authorised action** — `hooks/useAuthorisedAction.ts` is the hook version of
MF-React-SCU's `flow-confirmation-page` + `transferFlowSlice`:

| Mode | Steps | Used by |
|---|---|---|
| `CONFIRM_ONLY` | details → Confirm → final service | Own-account transfer |
| `CONFIRM_OTP` | details → Confirm → `OTP_GENERATION` → OTP → final | Transfer to MF Bank / other bank |
| `OTP_ONLY` | `OTP_GENERATION` → OTP → final | Change password, transfer limit, security questions |

Final call: `Status 00` → success result, `06` → failed result (shown, not toasted), `03/04` → session reset.
Each platform renders it with its own `AuthorisedActionPanel` (same props on web and mobile).

| Feature | Shared hook | Services (unchanged from MF-React-SCU) |
|---|---|---|
| Own account | `useFundTransfer` | `FT_OWN_ACCOUNT_CONFIRMATION` → `FT_OWN_ACCOUNT_FINAL` |
| MF Bank account | `useFundTransfer` | `OTHER_SCU_BEN_DETAILS` (verify) → `FT_OTHER_SCU_CONFIRMATION` → OTP → `FT_OTHER_SCU_FINAL` |
| Other bank (SEFT) | `useFundTransfer` | `FT_LOCAL_BANK_CONFIRMATION` → OTP → `FT_LOCAL_BANK_FINAL` |
| Personal info + linked accounts | `useProfile` | `LINKED_ACCOUNTS_LIST` (falls back to login accounts) |
| Change password | `useChangePassword` | `CHANGE_PASSWORD_CONF` → OTP → `SAVE_CHANGE_PASSWORD` → log in again |
| Transfer limit | `useChangeLimits` | `CHANGE_LIMITS_CONF` → OTP → `CHANGE_LIMITS_FINAL` (store updated from result) |
| Security questions | `useResetSecurityQuestions` | `SECURITY_QUESTIONS`, `CHANGE_SECQUESTIONS_CONF` → OTP → `CHANGE_SECQUESTIONS_FINAL` |

Business rules kept from MF-React-SCU: own transfers only with 2+ accounts; "To account" excludes "From";
shares-membership destination → multiples of 100; narration and purpose 10–50 characters; mobile number
sent with `+248`; SEFT cut-off notice must be accepted; limit cannot exceed the global limit and an
unchanged limit is refused.

| | Web | Mobile |
|---|---|---|
| Fund transfer | Sidebar → **Fund transfer** (`/transfer`), tabs per transfer type | **Transfer** tab |
| My Profile | Sidebar → **My profile** (`/profile`), four sections | Settings tab → **My profile**; each change on its own screen |

Not ported yet: profile photo upload/delete, link / de-link accounts, quick transfer from the dashboard,
standing orders, transfer receipt download.

## 13. Login per platform: password on web, MPIN on mobile

One file decides how each platform signs in — `packages/shared/src/config/login.config.ts`:

```ts
export const LOGIN_CONFIG = {
  web:    { method: "password", captcha: true,  otp: true,  registrationCredential: "password" },
  mobile: { method: "mpin",     captcha: false, otp: false, registrationCredential: "mpin", mpin: { length: 6 } },
};
```

`getLoginConfig()` picks the entry from the `platform` given to `configureShared()` (web → `web`, ios/android → `mobile`).
The mobile login screen shows the form for `method`, so switching mobile back to `"password"` needs only this file.

| | Web | Mobile |
|---|---|---|
| Fields | Username, password, captcha | Username, MPIN (6 digits, numbers only, masked) |
| Then | OTP | — signed in |
| Service | `SERVICE_AUTH` → `GENERATE_OTP_FOR_LOGIN` | `MPIN_LOGIN { UID, MPIN }` → SessionID + DBData |
| Hook | `useLogin` | `useMpinLogin` |
| Registration | Verify → OTP → security questions → username + **password** | Verify → OTP → security questions → username + **MPIN** (entered twice) |
| Registration service | `REGISTRATION_USERNAME_PASSWORD` | `REGISTRATION_USERNAME_MPIN { accountNumber, username, mpin, confirmMpin }` (code to confirm) |
| Wrong attempts | Cooldown: 3 tries → 30 s, doubling, max 5 min (`useLoginCooldown`, shared) | Same |

| Piece | File |
|---|---|
| Config (one place) | `packages/shared/src/config/login.config.ts` |
| MPIN login hook | `packages/shared/src/hooks/useMpinLogin.ts` |
| Shared cooldown | `packages/shared/src/hooks/useLoginCooldown.ts` |
| Validators | `validators.mpinFormat(length)` (login), `validators.mpin(length)` (creating an MPIN: also rejects 111111 / 123456 / 654321) |
| Service | `auth.api.ts` → `mpinLogin` (`MPIN_LOGIN`, code to confirm with the backend) |
| Mobile screens | `apps/mobile/src/modules/public/login/` — `login-screen.tsx` picks `components/MpinLogin.tsx` or `components/PasswordLogin.tsx` |
| MPIN input | `apps/mobile/src/shared/ui/form/FormMpin.tsx` (number pad, masked, no autofill / copy-paste) |

Notes
- The MPIN is created in registration's last step (`R-Credentials.tsx` → `useRegistration().submitMpinCredentials`); the OTP step of registration is unchanged. MPIN rules there: 6 digits, no 111111 / 123456 / 654321, must match the confirmation.
- In the mock, a customer registered on mobile can sign in straight away with the new username and MPIN.
- The MPIN travels inside the same encrypted request envelope as the password and is never stored on the phone.
- The server must lock the MPIN after a few wrong tries (the mock locks after 5).
- Demo: username `demo`, MPIN `246810`.
