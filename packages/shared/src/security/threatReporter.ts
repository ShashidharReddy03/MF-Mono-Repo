/**
 * Automated threat alerts (checklist #31) — shared by web and mobile.
 * Sends each security event to the backend once per app run (or when its details
 * change), using the normal encrypted request pipeline. No-op until
 * configureShared({ threatReportService }) is set.
 */
import { getConfig } from "../config/platform";
import { buildRequest, postRequest } from "../api/requestConfig";
import { log } from "../utils/logger";

export type ThreatSeverity = "block" | "isolate" | "warn" | "report";

export type ThreatEvent = {
  /** e.g. "jailbroken", "frida", "csp-violation", "framed" */
  id: string;
  severity: ThreatSeverity;
  detail?: string;
};

const sent = new Map<string, string>();

export const reportThreats = async (events: ThreatEvent[]) => {
  const fresh = events.filter((e) => sent.get(e.id) !== `${e.severity}|${e.detail ?? ""}`);
  if (!fresh.length) return;
  fresh.forEach((e) => sent.set(e.id, `${e.severity}|${e.detail ?? ""}`));

  const { threatReportService, platform } = getConfig();
  log("Security events:", fresh);
  if (!threatReportService) return;
  try {
    await postRequest(
      buildRequest(
        { platform, reportedAt: new Date().toISOString(), threats: fresh.map((e) => ({ ...e, detail: (e.detail ?? "").slice(0, 300) })) },
        threatReportService,
      ),
      { skipSessionCheck: true },
    );
  } catch {
    // reporting must never disturb the customer; it is retried on the next change
    fresh.forEach((e) => sent.delete(e.id));
  }
};

/** Reset de-duplication (e.g. after logout) */
export const resetThreatReports = () => sent.clear();
