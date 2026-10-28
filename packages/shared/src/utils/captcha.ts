import { getConfig } from "../config/platform";

/** No 0/O/1/I to avoid confusion */
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Uses the secure RNG (the demo used Math.random) */
export const generateCaptcha = (length = 6): string => {
  const bytes = getConfig().getRandomBytes(length);
  return Array.from(bytes, (b) => CAPTCHA_CHARS[b % CAPTCHA_CHARS.length]).join("");
};

export const validateCaptcha = (input: string, actual: string) =>
  !!input && !!actual && input.trim() === actual;
