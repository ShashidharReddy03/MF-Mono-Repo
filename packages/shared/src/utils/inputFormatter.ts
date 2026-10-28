/**
 * Input sanitisers applied on every keystroke (ported from the demo).
 * They strip characters commonly used in injection payloads before the value
 * ever reaches form state.
 */
export type DynamicInputType =
  | "text"
  | "number"
  | "alpha"
  | "alphanumeric"
  | "amount"
  | "password"
  | "username"
  | "email";

export const inputFormatters: Record<DynamicInputType, (value: string) => string> = {
  text: (v) => v.trimStart().replace(/[<>(){}[\];:"`]/g, ""),
  number: (v) => v.replace(/\D/g, ""),
  alpha: (v) => v.trimStart().replace(/[^a-zA-Z ]/g, "").replace(/\s+/g, " "),
  alphanumeric: (v) => v.trimStart().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " "),
  password: (v) => v.replace(/[^a-zA-Z0-9!@#&*]/g, ""),
  username: (v) => v.trimStart().replace(/[^a-zA-Z0-9]/g, ""),
  email: (v) => v.trim().replace(/[^a-zA-Z0-9._%+@-]/g, ""),
  amount: (raw) => {
    let v = raw.trim().replace(/[^\d.]/g, "");
    if (v.startsWith(".")) return "";
    v = v.replace(/^0+(?=\d)/, "");
    const [intRaw = "", dec] = v.split(".");
    const intPart = intRaw.slice(0, 13).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec !== undefined ? `${intPart}.${dec.slice(0, 2)}` : intPart;
  },
};

export const formatInput = (type: DynamicInputType, value: string) => inputFormatters[type](value ?? "");
