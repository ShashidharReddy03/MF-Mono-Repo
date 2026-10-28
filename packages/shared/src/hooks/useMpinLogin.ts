import { useCallback } from "react";
import { mpinLogin } from "../api/services/auth.api";
import { getLoginConfig } from "../config/login.config";
import { getConfig } from "../config/platform";
import { setLoginData } from "../store/slices/authSlice";
import { clearSession, setIsOtpVerified, setSessionId } from "../store/slices/sessionSlice";
import type { MpinLoginForm } from "../types";
import { t } from "../i18n";
import { useAppDispatch } from "./hooks";
import { useAsync } from "./useAsync";
import { useLoginCooldown } from "./useLoginCooldown";
import { readLoginDBData } from "./useLogin";

/**
 * Mobile login (login.config method "mpin"): username + MPIN.
 * One call — MPIN_LOGIN { UID, MPIN } → SessionID + DBData — and the customer is in.
 * Returns booleans so the screen decides what to do next.
 */
export const useMpinLogin = () => {
  const dispatch = useAppDispatch();
  const { execute, loading } = useAsync();
  const cooldown = useLoginCooldown();
  const length = getLoginConfig().mpin?.length ?? 6;

  const submit = useCallback(
    async (values: MpinLoginForm) => {
      const { toast } = getConfig();
      const wait = cooldown.secondsLeft();
      if (wait > 0) {
        toast.error(t("Too many attempts. Please wait {{n}} seconds.", { n: wait }));
        return false;
      }
      const res = await execute(() =>
        mpinLogin({ UID: values.username.toLowerCase().trim(), MPIN: values.mpin }),
      );
      if (!res) return false;

      if (res.statuscodep !== "00" || !res.SessionID || res.SessionID === "0") {
        toast.error(res.ResultMessage ?? t("Incorrect username or MPIN."));
        cooldown.registerFailure();
        return false;
      }
      const data = readLoginDBData(res);
      if (typeof data === "string") {
        toast.error(data);
        return false;
      }
      cooldown.registerSuccess();
      dispatch(clearSession());
      dispatch(setSessionId(res.SessionID));
      dispatch(setLoginData(data));
      dispatch(setIsOtpVerified(true));
      return true;
    },
    [cooldown, dispatch, execute],
  );

  return { length, loading, lockedSeconds: cooldown.lockedSeconds, submit };
};
