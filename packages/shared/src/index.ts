/**
 * @mf-bank/shared — public surface.
 * Apps import ONLY from here: `import { useLogin, configureShared } from "@mf-bank/shared"`.
 */

// config
export * from "./config/platform";
export * from "./config/theme";
export * from "./config/login.config";

// security (exported for tests / diagnostics)
export * from "./security/encoding";
export * from "./security/crypto.service";
export * from "./security/envelope";
export { parseSpkiPublicKey, rsaEncrypt } from "./security/rsa";

// api
export * from "./api/services";
export { apiRequest, buildRequest, postRequest } from "./api/requestConfig";
export { validateResponse, type ValidateResponse } from "./api/responseValidator";
export { handleApiError } from "./api/handleApiError";
export { SessionTimeoutError } from "./api/errors";
export { MOCK_CREDENTIALS } from "./api/mock/mockData";

// types
export * from "./types";

// store
export * from "./store/store";
export * from "./store/slices/sessionSlice";
export * from "./store/slices/authSlice";
export * from "./store/slices/loaderSlice";
export * from "./store/slices/registrationSlice";
export * from "./store/slices/recoverySlice";

// hooks
export * from "./hooks/hooks";
export * from "./hooks/useAsync";
export * from "./hooks/useOtpTimer";
export * from "./hooks/useCaptcha";
export * from "./hooks/useLogin";
export * from "./hooks/useLoginCooldown";
export * from "./hooks/useMpinLogin";
export * from "./hooks/useLogout";
export * from "./hooks/useRegistration";
export * from "./hooks/useRecovery";
export * from "./hooks/useDashboard";
export * from "./hooks/useStatements";
export * from "./hooks/useBeneficiaries";
export * from "./hooks/useAddBeneficiary";

// business logic / utils
export * from "./utils/validators";
export * from "./utils/inputFormatter";
export * from "./utils/captcha";
export * from "./utils/format";
export * from "./utils/date";
export * from "./utils/securityQuestions";
export * from "./utils/idleTimer";
export * from "./utils/logger";
export * from "./i18n";
export * from "./hooks/useAuthorisedAction";
export * from "./hooks/useFundTransfer";
export * from "./hooks/useProfile";
export * from "./security/threatReporter";
export * from "./security/remoteSecurityConfig";
export * from "./hooks/useSessionLimit";
