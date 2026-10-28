import { useCallback, useRef, useState } from "react";
import { handleApiError } from "../api/handleApiError";

/** Wraps an async call: local loading flag + centralised error toasts */
export const useAsync = () => {
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(0);

  const execute = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    inFlight.current += 1;
    setLoading(true);
    try {
      return await fn();
    } catch (err) {
      handleApiError(err);
      return undefined;
    } finally {
      inFlight.current -= 1;
      if (inFlight.current === 0) setLoading(false);
    }
  }, []);

  return { loading, execute };
};
