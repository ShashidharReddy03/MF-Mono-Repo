import axios from "axios";
import { getConfig } from "../config/platform";
import { SessionTimeoutError } from "./errors";
import { t } from "../i18n";

/** Maps transport failures to user-friendly messages (never leaks internals) */
export const handleApiError = (err: unknown) => {
  const { toast } = getConfig();
  if (err instanceof SessionTimeoutError) return;

  if (axios.isAxiosError(err)) {
    if (err.code === "ERR_CANCELED") return;
    if (!err.response) {
      toast.error(t("We are unable to connect to the service right now. Please try again."));
      return;
    }
    const status = err.response.status;
    if (status === 401) return toast.error(t("Your session has expired. Please log in again."));
    if (status === 403) return toast.error(t("You do not have permission to complete this action."));
    if (status === 404) return toast.error(t("We could not find the requested information."));
    if (status >= 500) return toast.error(t("We are unable to process your request right now. Please try again later."));
    return toast.error(t("We could not complete your request. Please try again."));
  }

  toast.error(t("We are unable to complete your request right now. Please try again later."));
};
