/**
 * Browser-side security guards (production builds). Web equivalents of the
 * mobile checklist where a browser allows it:
 *   #22 tapjacking → clickjacking: refuse to run inside another site's frame
 *   #11 SSL        → refuse to run outside a secure (HTTPS) context
 *   #4  injection  → report Content-Security-Policy violations
 *   #31 alerts     → all of the above go to the shared threat reporter
 * Server headers (deploy/) are the primary defence; these catch misconfiguration.
 */
import { reportThreats, t } from "@mf-bank/shared";

const stopPage = (message: string) => {
  // replace the page with a plain message; nothing of the app is rendered
  document.documentElement.innerHTML = "";
  const body = document.createElement("body");
  body.style.cssText = "font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center;color:#002B63";
  body.textContent = message;
  document.documentElement.appendChild(body);
};

/** Returns false when the app must not start */
export const installBrowserGuards = (): boolean => {
  if (!import.meta.env.PROD) return true;

  // clickjacking: never render inside a frame
  if (window.top !== window.self) {
    void reportThreats([{ id: "framed", severity: "block", detail: document.referrer }]);
    try {
      window.top!.location.href = window.self.location.href; // break out when allowed
    } catch {
      /* cross-origin parent blocks it — fall through */
    }
    stopPage(t("For your security, MF Bank can't be opened inside another website."));
    return false;
  }

  // transport: only HTTPS (localhost counts as secure for testing)
  if (!window.isSecureContext) {
    void reportThreats([{ id: "insecure-context", severity: "block", detail: location.protocol }]);
    stopPage(t("MF Bank can only be used over a secure (HTTPS) connection."));
    return false;
  }

  // injected / unexpected scripts and connections blocked by the CSP
  document.addEventListener("securitypolicyviolation", (e) => {
    void reportThreats([
      { id: "csp-violation", severity: "report", detail: `${e.violatedDirective} ${e.blockedURI}`.slice(0, 300) },
    ]);
  });

  return true;
};
