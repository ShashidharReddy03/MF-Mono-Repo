/**
 * Dependency-free encoders.
 *
 * We deliberately avoid atob/btoa/TextEncoder/TextDecoder because they are
 * missing or incomplete on some React Native (Hermes) versions. These
 * implementations behave identically in the browser and on device.
 */

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const B64_LOOKUP: Record<string, number> = {};
for (let i = 0; i < B64.length; i++) B64_LOOKUP[B64[i]] = i;

export const utf8Encode = (value: string): Uint8Array => {
  const out: number[] = [];
  for (const ch of value) {
    let cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      cp = Math.min(cp, 0x10ffff);
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return Uint8Array.from(out);
};

export const utf8Decode = (bytes: Uint8Array): string => {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i++];
    let cp: number;
    if (b0 < 0x80) {
      cp = b0;
    } else if (b0 >> 5 === 0x06) {
      cp = ((b0 & 0x1f) << 6) | (bytes[i++] & 0x3f);
    } else if (b0 >> 4 === 0x0e) {
      cp = ((b0 & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
    } else {
      cp =
        ((b0 & 0x07) << 18) |
        ((bytes[i++] & 0x3f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
    }
    out += String.fromCodePoint(cp);
  }
  return out;
};

export const base64Encode = (bytes: Uint8Array): string => {
  let out = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += i + 1 < len ? B64[(n >> 6) & 63] : "=";
    out += i + 2 < len ? B64[n & 63] : "=";
  }
  return out;
};

export const base64Decode = (input: string): Uint8Array => {
  const clean = input.replace(/[^A-Za-z0-9+/]/g, "");
  const outLen = Math.floor((clean.length * 3) / 4);
  const out = new Uint8Array(outLen);
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64_LOOKUP[clean[i]] << 18) |
      ((B64_LOOKUP[clean[i + 1]] ?? 0) << 12) |
      ((B64_LOOKUP[clean[i + 2]] ?? 0) << 6) |
      (B64_LOOKUP[clean[i + 3]] ?? 0);
    if (o < outLen) out[o++] = (n >> 16) & 0xff;
    if (o < outLen) out[o++] = (n >> 8) & 0xff;
    if (o < outLen) out[o++] = n & 0xff;
  }
  return out;
};

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

export const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.length % 2 ? `0${hex}` : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
};

export const stringToHex = (value: string): string => bytesToHex(utf8Encode(value));

export const concatBytes = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
};
