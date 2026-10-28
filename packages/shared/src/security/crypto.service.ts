/**
 * Crypto primitives — ported 1:1 from the demo's core/services/crypto.service.ts.
 * Function names (neasr / nefm / edfm) are kept so the two code bases are easy
 * to compare, but the implementation is now pure JS so it runs on web AND
 * React Native:
 *
 *   demo (web only)                 shared (web + mobile)
 *   ------------------------------  ------------------------------------
 *   crypto.subtle AES-GCM            @noble/ciphers gcm  (audited)
 *   crypto.subtle HMAC SHA-512       @noble/hashes hmac+sha512 (audited)
 *   JSEncrypt RSA                    ./rsa.ts (BigInt, PKCS#1 v1.5)
 *   crypto.getRandomValues           config.getRandomBytes (WebCrypto / expo-crypto)
 *
 * Wire format is unchanged: base64( IV[12] || ciphertext || tag[16] ).
 */
import { gcm } from "@noble/ciphers/aes.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { getConfig } from "../config/platform";
import {
  base64Encode,
  bytesToHex,
  concatBytes,
  stringToHex,
  utf8Decode,
  utf8Encode,
} from "./encoding";
import { rsaEncrypt } from "./rsa";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Secure random [A-Za-z0-9] string (used for one-time AES + HMAC keys) */
export const generateRandomAlphaNumeric = (length: number): string => {
  const bytes = getConfig().getRandomBytes(length * 2);
  let out = "";
  // rejection sampling → no modulo bias (62 * 4 = 248)
  for (let i = 0; i < bytes.length && out.length < length; i++) {
    if (bytes[i] < 248) out += ALPHANUMERIC[bytes[i] % 62];
  }
  return out.length === length ? out : out + generateRandomAlphaNumeric(length - out.length);
};

/** RSA encrypt with the server public key */
export const neasr = (content: string): string => rsaEncrypt(content);

/** AES-128-GCM encrypt → base64(IV || ciphertext || tag) */
export const nefm = async (payload: string, aesKey: string): Promise<string> => {
  const keyBytes = utf8Encode(aesKey);
  if (keyBytes.length !== 16) throw new Error("Key must be 16 bytes");
  const iv = getConfig().getRandomBytes(12);
  const encrypted = gcm(keyBytes, iv).encrypt(utf8Encode(payload));
  return base64Encode(concatBytes(iv, encrypted));
};

/** AES-GCM decrypt (ciphertext includes the 16-byte tag at the end) */
export const edfm = async (
  ciphertext: Uint8Array,
  aesKey: string,
  iv: Uint8Array,
): Promise<string> => {
  const keyBytes = utf8Encode(aesKey);
  if (![16, 24, 32].includes(keyBytes.length)) {
    throw new Error(`Invalid AES key length: ${keyBytes.length}`);
  }
  return utf8Decode(gcm(keyBytes, iv).decrypt(ciphertext));
};

/** HMAC-SHA512 → lowercase hex */
export const generateHmacSHA512 = async (data: string, key: string): Promise<string> =>
  bytesToHex(hmac(sha512, utf8Encode(key), utf8Encode(data)));

/**
 * The server sends a base key in the `ky` header. The real AES key is:
 *   hex(ky) with its first `replaceNum` chars replaced by hex(IV).
 */
export const buildDynamicKey = (
  originalKey: string,
  iv: Uint8Array,
  replaceNum: number,
): string => {
  const keyHex = stringToHex(originalKey);
  const ivPrefix = bytesToHex(iv).substring(0, replaceNum);
  return ivPrefix + keyHex.substring(ivPrefix.length);
};
