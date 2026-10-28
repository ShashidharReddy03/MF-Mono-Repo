/**
 * Every call is a POST to one endpoint; the backend routes on `ReqService`.
 * buildRequest() merges the static device/app fields + session id.
 */
import { getConfig } from "../config/platform";
import { startLoading, stopLoading } from "../store/slices/loaderSlice";
import { resetAll, store } from "../store/store";
import type { RawServerResponse } from "../types";
import { log } from "../utils/logger";
import { getHttpClient } from "./client";
import { SessionTimeoutError } from "./errors";
import { mockServer } from "./mock/mockServer";
import { validateResponse, type ValidateResponse } from "./responseValidator";
import { t } from "../i18n";

export type ServiceRequest = Record<string, unknown> & {
  ReqService: string;
  ReqSessionID: string;
};

const baseReqData = () => {
  const c = getConfig();
  return {
    ReqSourceID: c.reqSourceId,
    IsEmulator: c.device.isEmulator,
    IsBluetooth: c.device.bluetooth,
    ReqAPIV: c.reqApiVersion,
    ipadd: c.device.ipAddress,
    ReqSource: c.reqSource,
    ReqLK: c.reqLK,
    langcode: c.langCode,
    isRootedApp: c.device.isRooted,
    ...(c.device.securityFields ?? {}),
  };
};

export const buildRequest = <T extends object>(data: T, service: string): ServiceRequest => ({
  ...baseReqData(),
  ...data,
  ReqService: service,
  ReqSessionID: store.getState().session.sessionId || "0",
});

type PostOptions = { skipSessionCheck?: boolean };

/** Low-level send: mock or HTTP + global loader + statuscodep 98 handling */
export const postRequest = async <T extends RawServerResponse = RawServerResponse>(
  request: ServiceRequest,
  options?: PostOptions,
): Promise<T> => {
  const config = getConfig();
  store.dispatch(startLoading());
  try {
    log("Payload:::", request);
    const data = (
      config.useMock ? await mockServer.handle(request) : (await getHttpClient().post("", request)).data
    ) as T;
    log("Response:::", data);

    if (data?.statuscodep === "98" && !options?.skipSessionCheck) {
      config.toast.error(data.ResultMessage ?? t("Your session has expired."));
      store.dispatch(resetAll());
      config.onSessionExpired?.(data.ResultMessage);
      throw new SessionTimeoutError();
    }
    return data;
  } finally {
    store.dispatch(stopLoading());
  }
};

type ApiRequestOptions = PostOptions & { showErrorToast?: boolean };

/** Typed service call → validated { success, data } result */
export const apiRequest = async <TResponse, TPayload extends object = Record<string, never>>(
  service: string,
  payload?: TPayload,
  options?: ApiRequestOptions,
): Promise<ValidateResponse<TResponse>> => {
  const data = await postRequest(buildRequest(payload ?? {}, service), options);
  return validateResponse<TResponse>(data, options);
};
