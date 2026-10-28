import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { Modal } from "@ant-design/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchRemoteSecurityConfig,
  log,
  reportThreats,
  selectIsAuthenticated,
  t,
  updateDeviceInfo,
  useAppSelector,
  useLogout,
  type RemoteSecurityConfig,
} from "@mf-bank/shared";
import { DeviceSecurity, isDeviceSecurityAvailable } from "../../../modules/device-security";
import { runDeviceChecks, toSecurityFields, type DeviceReport, type Finding } from "@/core/security/deviceChecks";
import {
  CHECK_TEXT,
  ENFORCEMENT,
  FULL_CHECK_MS,
  QUICK_CHECK_MS,
  SECURITY_CONFIG_URL,
  SEND_SECURITY_FIELDS,
} from "@/core/security/securityPolicy";

const REMOTE_REFRESH_MS = 30 * 60_000;

/**
 * Live threat monitoring (#33) and control response to risk (#32):
 *  - full check at start-up, every return to the foreground and every minute;
 *    quick check (screen sharing, calls, debugger, network) every 5 seconds
 *  - remote (OTA) security config refreshed every 30 minutes (#30)
 *  - every finding is reported to the server once (#31)
 *  - isolate → session ended, app data cleared, app locked for this run (#34)
 *  - block → locked while the problem lasts · warn → one notice per run
 */
export const useDeviceSecurity = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const logout = useLogout();
  const [report, setReport] = useState<DeviceReport | null>(null);
  const [isolated, setIsolated] = useState<Finding[]>([]);
  const remote = useRef<RemoteSecurityConfig | null>(null);
  const remoteAt = useRef(0);
  const last = useRef<DeviceReport | null>(null);
  const running = useRef(false);
  const warned = useRef(new Set<string>());

  const refreshRemote = useCallback(async () => {
    if (!SECURITY_CONFIG_URL || Date.now() - remoteAt.current < REMOTE_REFRESH_MS) return;
    remoteAt.current = Date.now();
    const cfg = await fetchRemoteSecurityConfig(SECURITY_CONFIG_URL);
    if (cfg) remote.current = cfg; // keep the last good config if the fetch fails
  }, []);

  const check = useCallback(
    async (quick: boolean) => {
      if (ENFORCEMENT === "off" || running.current) return;
      running.current = true;
      try {
        if (!quick) await refreshRemote();
        const next = await runDeviceChecks(quick, remote.current);
        const prev = last.current;
        const merged: DeviceReport =
          quick && prev
            ? {
                ...prev,
                findings: prev.findings.map((f) => next.findings.find((n) => n.id === f.id) ?? f),
                info: { ...prev.info, ...next.info },
                checkedAt: next.checkedAt,
              }
            : next;
        last.current = merged;

        const find = (id: Finding["id"]) => merged.findings.find((f) => f.id === id)?.detected;
        updateDeviceInfo({
          isEmulator: find("simulator") ? "Y" : "N",
          isRooted: !!find("jailbroken"),
          securityFields: SEND_SECURITY_FIELDS ? toSecurityFields(merged) : undefined,
        });

        const detected = merged.findings.filter((f) => f.detected === true);
        void reportThreats(detected.map((f) => ({ id: f.id, severity: f.action, detail: f.detail })));
        if (__DEV__ && detected.length) log("Device security:", detected.map((f) => `${f.id}:${f.action}`));
        setReport(merged);
      } finally {
        running.current = false;
      }
    },
    [refreshRemote],
  );

  useEffect(() => {
    if (ENFORCEMENT === "off") return;
    // #22 tapjacking + #26 screen overlay (Android): always on
    if (isDeviceSecurityAvailable() && Platform.OS === "android") {
      try {
        DeviceSecurity().enableOverlayProtection();
      } catch {
        /* activity not ready — retried on the next foreground */
      }
    }
    void check(false);
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") return;
      if (isDeviceSecurityAvailable() && Platform.OS === "android") {
        try {
          DeviceSecurity().enableOverlayProtection();
        } catch {
          /* ignore */
        }
      }
      void check(false);
    });
    const quickTimer = setInterval(() => void check(true), QUICK_CHECK_MS);
    const fullTimer = setInterval(() => void check(false), FULL_CHECK_MS);
    return () => {
      sub.remove();
      clearInterval(quickTimer);
      clearInterval(fullTimer);
    };
  }, [check]);

  const enforce = ENFORCEMENT === "enforce";
  const detected = report?.findings.filter((f) => f.detected === true) ?? [];

  // #34 device isolation: sticky for this app run
  const newIsolations = enforce ? detected.filter((f) => f.action === "isolate" && !isolated.some((i) => i.id === f.id)) : [];
  useEffect(() => {
    if (!newIsolations.length) return;
    setIsolated((prev) => [...prev, ...newIsolations]);
    void logout();
    // remove everything the app stored on this device (language / theme preferences)
    void AsyncStorage.clear().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newIsolations.map((f) => f.id).join(",")]);

  const blocking = enforce
    ? [...isolated, ...detected.filter((f) => f.action === "block" && !isolated.some((i) => i.id === f.id))]
    : [];
  const warnings = enforce ? detected.filter((f) => f.action === "warn") : [];

  // a compromised device must not keep a live session (screen sharing / old version only hide the app)
  const mustEndSession = blocking.some((f) => f.id !== "screenCaptured" && f.id !== "outdatedApp");
  useEffect(() => {
    if (mustEndSession && isAuth) void logout();
  }, [mustEndSession, isAuth, logout]);

  const warningIds = warnings.map((w) => w.id).join(",");
  useEffect(() => {
    if (blocking.length) return;
    const fresh = warnings.filter((w) => !warned.current.has(w.id));
    if (!fresh.length) return;
    fresh.forEach((w) => warned.current.add(w.id));
    Modal.alert(t("Security notice"), fresh.map((w) => `• ${CHECK_TEXT[w.id].title}`).join("\n"), [{ text: t("OK") }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warningIds, blocking.length]);

  return {
    report,
    blocking,
    isolated: isolated.length > 0,
    updateUrl: remote.current?.updateUrl?.[Platform.OS === "ios" ? "ios" : "android"],
    recheck: () => check(false),
  };
};
