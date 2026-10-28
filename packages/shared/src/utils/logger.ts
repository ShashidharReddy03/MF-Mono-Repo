import { getConfig, isConfigured } from "../config/platform";

/** Never logs in production builds (payloads may contain PII) */
export const log = (...args: unknown[]) => {
  if (isConfigured() && getConfig().isProduction) return;
  console.log(...args);
};
