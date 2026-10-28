import { useCallback, useEffect, useState } from "react";

/** Resend-OTP countdown */
export const useOtpTimer = (seconds = 60) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);
  const label = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return { remaining, canResend: remaining <= 0, restart, label };
};
