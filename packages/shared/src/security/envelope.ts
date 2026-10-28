/**
 * Request / response envelopes — the logic that lived inside the demo's
 * axios interceptors, extracted into pure functions so it can be unit-tested
 * and reused by any transport.
 */
import { base64Decode } from "./encoding";
import {
  buildDynamicKey,
  edfm,
  generateHmacSHA512,
  generateRandomAlphaNumeric,
  neasr,
  nefm,
} from "./crypto.service";

export type EncryptedRequest = {
  body: string;
  headers: {
    ky: string; // RSA(aesKey)
    DhKy: string; // RSA(hmacKey)
    nonce: string; // RSA(HMAC-SHA512(payload, hmacKey))
    "Content-Type": "text/plain";
  };
};

/**
 * 1. fresh random 16-char AES key + 16-char HMAC key per request
 * 2. body   = AES-GCM(payload)
 * 3. nonce  = HMAC-SHA512(payload)  → integrity / anti-tamper
 * 4. keys + nonce are RSA-wrapped with the server public key
 */
export const encryptRequest = async (data: unknown): Promise<EncryptedRequest> => {
  const aesKey = generateRandomAlphaNumeric(16);
  const hmacKey = generateRandomAlphaNumeric(16);
  const payload = JSON.stringify(data);

  const [body, hmacHex] = await Promise.all([
    nefm(payload, aesKey),
    generateHmacSHA512(payload, hmacKey),
  ]);

  return {
    body,
    headers: {
      ky: neasr(aesKey),
      DhKy: neasr(hmacKey),
      nonce: neasr(hmacHex),
      "Content-Type": "text/plain",
    },
  };
};

/**
 * Response format: base64(IV || ct || tag) + 2 trailing digits.
 * The 2 digits are an ASCII code; that character is the number of hex
 * chars of IV that overwrite the key from the `ky` header.
 * Returns null when the body is not an encrypted envelope.
 */
export const decryptResponse = async (
  rawBody: string,
  responseKy: string,
): Promise<string | null> => {
  const clean = rawBody.replace(/\r?\n|\r/g, "").trim();
  if (clean.length < 3) return null;

  const ascii = Number(clean.slice(-2));
  const replaceNum = Number.parseInt(String.fromCodePoint(ascii), 10);
  if (Number.isNaN(replaceNum)) return null;

  const bytes = base64Decode(clean.slice(0, -2));
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);
  const dynamicKey = buildDynamicKey(responseKy.trim(), iv, replaceNum);
  return edfm(ciphertext, dynamicKey, iv);
};
