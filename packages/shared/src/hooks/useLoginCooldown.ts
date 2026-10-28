import { useCallback, useEffect, useRef, useState } from "react";

/** Client-side brute-force brake: after 3 failures wait 30 s, doubling each time (max 5 min).
 *  The server must still enforce its own lockout — this only slows automated guessing.
 *  Shared by password login (web + mobile set-up) and MPIN login. */
export const LOGIN_FREE_ATTEMPTS = 3;
const lockoutMs = (failures: number) => Math.min(30_000 * 2 ** (failures - LOGIN_FREE_ATTEMPTS), 5 * 60_000);

export const useLoginCooldown = () => {
  const failures = useRef(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const lockedSeconds = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  // tick once a second while locked so the countdown updates
  useEffect(() => {
    if (lockUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const registerFailure = useCallback(() => {
    failures.current += 1;
    if (failures.current >= LOGIN_FREE_ATTEMPTS) {
      setLockUntil(Date.now() + lockoutMs(failures.current));
      setNow(Date.now());
    }
  }, []);

  const registerSuccess = useCallback(() => {
    failures.current = 0;
  }, []);

  /** Seconds left, read at call time (for guards inside async handlers) */
  const secondsLeft = useCallback(() => Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)), [lockUntil]);

  return { lockedSeconds, secondsLeft, registerFailure, registerSuccess };
};
