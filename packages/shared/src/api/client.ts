/**
 * HTTP transport. Encryption/decryption happens in axios interceptors
 * exactly like the demo's core/api/axios.ts, but the crypto is delegated to
 * the pure envelope functions in ../security.
 */
import axios, { type AxiosInstance } from "axios";
import { getConfig } from "../config/platform";
import { decryptResponse, encryptRequest } from "../security/envelope";
import { log } from "../utils/logger";

let instance: AxiosInstance | null = null;

const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getConfig().apiUrl,
    responseType: "text",
    timeout: 60_000,
    // never let axios try to JSON.parse the encrypted text body
    transformResponse: [(data) => data],
  });

  client.interceptors.request.use(async (config) => {
    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    if (!config.data || isFormData) return config;

    const envelope = await encryptRequest(config.data);
    config.data = envelope.body;
    Object.entries(envelope.headers).forEach(([k, v]) => config.headers.set(k, v));
    return config;
  });

  client.interceptors.response.use(async (response) => {
    const ky = response.headers["ky"] as string | undefined;
    const body = response.data as unknown;
    if (typeof body !== "string" || !body) return response;

    try {
      if (ky) {
        const decrypted = await decryptResponse(body, ky);
        if (decrypted !== null) {
          response.data = JSON.parse(decrypted);
          return response;
        }
      }
      response.data = JSON.parse(body);
    } catch (error) {
      log("Response decrypt/parse failed:", error);
    }
    return response;
  });

  return client;
};

export const getHttpClient = (): AxiosInstance => {
  instance ??= createHttpClient();
  return instance;
};
