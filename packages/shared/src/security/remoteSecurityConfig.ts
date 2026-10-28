/**
 * Over-the-air security configuration (checklist #30, #32) — shared by web and mobile.
 * The bank can tighten rules without shipping an app update:
 *   - minAppVersion  → older apps must update (forced update screen on mobile)
 *   - policy         → change the response per threat (block / isolate / warn / report)
 *   - blacklist      → extra Android packages / iOS URL schemes to treat as risky apps
 * Served as static JSON from a bank-controlled HTTPS URL (pinned on mobile).
 */
export type RemoteSecurityConfig = {
  minAppVersion?: string;
  policy?: Record<string, "block" | "isolate" | "warn" | "report">;
  blacklist?: { android?: string[]; ios?: string[] };
  /** store page for the forced-update button */
  updateUrl?: { android?: string; ios?: string };
};

const ACTIONS = new Set(["block", "isolate", "warn", "report"]);

/** Accept only well-formed fields — a bad file must never weaken anything by accident */
export const parseRemoteSecurityConfig = (raw: unknown): RemoteSecurityConfig => {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: RemoteSecurityConfig = {};
  if (typeof r.minAppVersion === "string" && /^\d+(\.\d+){0,3}$/.test(r.minAppVersion)) out.minAppVersion = r.minAppVersion;
  if (r.policy && typeof r.policy === "object") {
    out.policy = Object.fromEntries(
      Object.entries(r.policy as Record<string, unknown>).filter(([, v]) => typeof v === "string" && ACTIONS.has(v)),
    ) as RemoteSecurityConfig["policy"];
  }
  const bl = r.blacklist as Record<string, unknown> | undefined;
  if (bl && typeof bl === "object") {
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length < 200) : undefined);
    out.blacklist = { android: list(bl.android), ios: list(bl.ios) };
  }
  const up = r.updateUrl as Record<string, unknown> | undefined;
  if (up && typeof up === "object") {
    const https = (v: unknown) => (typeof v === "string" && v.startsWith("https://") ? v : undefined);
    out.updateUrl = { android: https(up.android), ios: https(up.ios) };
  }
  return out;
};

export const fetchRemoteSecurityConfig = async (url: string, timeoutMs = 8000): Promise<RemoteSecurityConfig | null> => {
  if (!url.startsWith("https://")) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) return null;
    return parseRemoteSecurityConfig(await res.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/** "1.2.10" < "1.10.0" aware comparison */
export const isVersionLower = (current: string, minimum: string) => {
  const a = current.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const b = minimum.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0);
  }
  return false;
};
