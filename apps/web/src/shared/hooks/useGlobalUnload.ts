import { useEffect } from "react";

/** PROD ONLY: warn before refresh/close (refresh = logout, state is in memory) */
function useGlobalUnloadWarning() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
}

export default useGlobalUnloadWarning;
