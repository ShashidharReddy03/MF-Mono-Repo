/**
 * LOGIN CONFIGURATION — the one place that decides how each platform signs in.
 *
 *   web     → username + password + captcha, then OTP
 *   mobile  → username + 6-digit MPIN (numbers only). No password, no captcha, no OTP.
 *
 * Registration (verification → OTP → security questions → credentials) is the same on
 * both, except the last step: web creates username + password, mobile username + MPIN.
 *
 * Both apps read this file; change a value here and the screens follow.
 */
import { getConfig } from "./platform";

export type LoginMethod = "password" | "mpin";

export type LoginConfig = {
  /** What the customer types next to the username */
  method: LoginMethod;
  /** Show the captcha on the login page */
  captcha: boolean;
  /** Ask for an OTP after the credentials */
  otp: boolean;
  /** What registration's last step creates next to the username */
  registrationCredential: LoginMethod;
  /** MPIN settings (login or registration with "mpin") */
  mpin?: {
    /** Number of digits */
    length: number;
  };
};

export const LOGIN_CONFIG: Record<"web" | "mobile", LoginConfig> = {
  web: {
    method: "password",
    captcha: true,
    otp: true,
    registrationCredential: "password",
  },
  mobile: {
    method: "mpin",
    captcha: false,
    otp: false,
    registrationCredential: "mpin",
    mpin: { length: 6 },
  },
};

/** Login settings for the platform this code is running on (web, or ios/android = mobile) */
export const getLoginConfig = (): LoginConfig =>
  LOGIN_CONFIG[getConfig().platform === "web" ? "web" : "mobile"];

/** MPIN length for the current platform (0 when MPIN isn't used) */
export const getMpinLength = () => getLoginConfig().mpin?.length ?? 0;
