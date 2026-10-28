/**
 * RSA encryption with PKCS#1 v1.5 padding (RSAES-PKCS1-v1_5, RFC 8017 §7.2).
 *
 * Replaces JSEncrypt from the demo project. JSEncrypt depends on `window`
 * and does not run on React Native; this ~80 line implementation uses
 * native BigInt (supported by browsers and Hermes) and produces output the
 * backend's `RSA/ECB/PKCS1Padding` cipher decrypts exactly as before.
 *
 * Only PUBLIC-key encryption is needed on the client, so there is no
 * private-key material and no secret-dependent timing to worry about.
 */
import { getConfig } from "../config/platform";
import { base64Decode, base64Encode, bytesToHex, hexToBytes, utf8Encode } from "./encoding";

type RsaPublicKey = { n: bigint; e: bigint; k: number };

type Tlv = { tag: number; start: number; length: number; next: number };

const readTlv = (der: Uint8Array, offset: number): Tlv => {
  const tag = der[offset];
  let lenByte = der[offset + 1];
  let cursor = offset + 2;
  let length = lenByte;
  if (lenByte & 0x80) {
    const count = lenByte & 0x7f;
    length = 0;
    for (let i = 0; i < count; i++) length = (length << 8) | der[cursor++];
  }
  return { tag, start: cursor, length, next: cursor + length };
};

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  bytes.length ? BigInt(`0x${bytesToHex(bytes)}`) : 0n;

const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
  let result = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
};

/** Parses a base64 SubjectPublicKeyInfo (with or without PEM armour). */
export const parseSpkiPublicKey = (key: string): RsaPublicKey => {
  const b64 = key
    .replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "")
    .replace(/["'\s;]/g, "");
  const der = base64Decode(b64);

  const spki = readTlv(der, 0); // SEQUENCE
  const algId = readTlv(der, spki.start); // SEQUENCE { OID, NULL }
  const bitString = readTlv(der, algId.next); // BIT STRING
  if (spki.tag !== 0x30 || bitString.tag !== 0x03) {
    throw new Error("Invalid RSA public key (expected SPKI)");
  }
  // first byte of BIT STRING = number of unused bits (0)
  const rsaSeq = readTlv(der, bitString.start + 1); // SEQUENCE { n, e }
  const nTlv = readTlv(der, rsaSeq.start);
  const eTlv = readTlv(der, nTlv.next);

  const n = bytesToBigInt(der.slice(nTlv.start, nTlv.next));
  const e = bytesToBigInt(der.slice(eTlv.start, eTlv.next));
  const k = Math.ceil(n.toString(16).length / 2);
  return { n, e, k };
};

let cachedKey: { source: string; key: RsaPublicKey } | null = null;

const getPublicKey = (): RsaPublicKey => {
  const { rsaPublicKey } = getConfig();
  if (cachedKey?.source !== rsaPublicKey) {
    cachedKey = { source: rsaPublicKey, key: parseSpkiPublicKey(rsaPublicKey) };
  }
  return cachedKey.key;
};

const nonZeroRandomBytes = (length: number): Uint8Array => {
  const { getRandomBytes } = getConfig();
  const out = new Uint8Array(length);
  let filled = 0;
  while (filled < length) {
    const chunk = getRandomBytes(length);
    for (let i = 0; i < chunk.length && filled < length; i++) {
      if (chunk[i] !== 0) out[filled++] = chunk[i];
    }
  }
  return out;
};

/** RSA/ECB/PKCS1Padding encrypt → base64 (same contract as JSEncrypt.encrypt) */
export const rsaEncrypt = (plainText: string, key = getPublicKey()): string => {
  const message = utf8Encode(plainText);
  if (message.length > key.k - 11) {
    throw new Error("RSA message too long");
  }
  // EM = 0x00 || 0x02 || PS (non-zero random) || 0x00 || M
  const ps = nonZeroRandomBytes(key.k - message.length - 3);
  const em = new Uint8Array(key.k);
  em[1] = 0x02;
  em.set(ps, 2);
  em.set(message, 3 + ps.length);

  const c = modPow(bytesToBigInt(em), key.e, key.n);
  const cBytes = hexToBytes(c.toString(16));
  const padded = new Uint8Array(key.k);
  padded.set(cBytes, key.k - cBytes.length);
  return base64Encode(padded);
};
