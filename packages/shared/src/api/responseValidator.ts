/**
 * Port of the demo's responseValidator. ResultMessage is itself a JSON
 * string containing { Status, Message }. Status codes:
 *   00 / 06 success
 *   01      business error (toast optional)
 *   03 / 04 error
 *   05      forced logout
 */
import { getConfig } from "../config/platform";
import { resetAll, store } from "../store/store";
import type { RawServerResponse } from "../types";
import { log } from "../utils/logger";
import { t } from "../i18n";

export type ValidateResponse<T = unknown> =
  | { success: true; data: T; message?: string; code?: string }
  | { success: false; data?: T; message?: string; code?: string };

type Options = { showErrorToast?: boolean };

export const validateResponse = <T = unknown>(
  responseData: RawServerResponse | string,
  options?: Options,
): ValidateResponse<T> => {
  const { toast, onSessionExpired } = getConfig();
  const showErrorToast = options?.showErrorToast ?? true;

  try {
    const parsed: RawServerResponse =
      typeof responseData === "string" ? JSON.parse(responseData) : responseData;

    if (parsed.ErrorMessage) {
      toast.error(parsed.ErrorMessage);
      return { success: false, message: parsed.ErrorMessage, code: parsed.statuscodep };
    }

    let message: unknown = parsed.ResultMessage;
    if (typeof message === "string") {
      try {
        message = JSON.parse(message);
      } catch {
        if (showErrorToast) toast.error(message as string);
        return { success: false, code: parsed.statuscodep, message: message as string };
      }
    }

    log("Parsed Response:::", message);
    const m = message as { Status?: string; status?: string; Message?: unknown };
    const status = m.Status ?? m.status;
    const text = typeof m.Message === "string" ? m.Message : undefined;

    switch (status) {
      case "00":
      case "06":
        return { success: true, data: m as T, message: text };

      case "05":
        store.dispatch(resetAll());
        if (text) toast.error(text);
        onSessionExpired?.(text);
        return { success: false, code: status, message: text };

      case "01":
        if (showErrorToast && text) toast.error(text);
        return { success: false, code: status, message: text };

      default:
        toast.error(text ?? t("Unknown server response."));
        return { success: false, code: status, message: text };
    }
  } catch {
    toast.error(t("Unexpected response format received."));
    return { success: false, message: "Validation failed" };
  }
};
