/**
 * Platform-agnostic inactivity timer. Web feeds it DOM events, mobile feeds
 * it touches + AppState changes. When it fires, the app logs the user out.
 */
export const createIdleTimer = (timeoutMs: number, onIdle: () => void) => {
  let handle: ReturnType<typeof setTimeout> | null = null;
  let lastActivity = Date.now();

  const stop = () => {
    if (handle) clearTimeout(handle);
    handle = null;
  };

  const reset = () => {
    lastActivity = Date.now();
    stop();
    handle = setTimeout(onIdle, timeoutMs);
  };

  /** For apps returning from background: fire immediately if overdue */
  const checkElapsed = () => {
    if (Date.now() - lastActivity >= timeoutMs) {
      stop();
      onIdle();
      return true;
    }
    return false;
  };

  return { reset, stop, checkElapsed };
};
