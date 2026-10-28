import { useCallback, useState } from "react";
import { generateCaptcha, validateCaptcha } from "../utils/captcha";

export const useCaptcha = (length = 6) => {
  const [value, setValue] = useState(() => generateCaptcha(length));
  const refresh = useCallback(() => setValue(generateCaptcha(length)), [length]);
  const validate = useCallback((input: string) => validateCaptcha(input, value), [value]);
  return { value, refresh, validate };
};
