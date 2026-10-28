#!/usr/bin/env node
/**
 * Lists texts used in the code that have no Arabic translation yet.
 *   npm run i18n:check
 * Finds: t("…"), required("Label"), requiredSelect("Label"), validator
 * messages in validators.ts, and wizard step names. Exit code 1 if anything
 * is missing, so CI can block untranslated releases.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["apps/web/src", "apps/mobile/src", "packages/shared/src"];
const AR = JSON.parse(readFileSync("packages/shared/src/i18n/locales/ar.json", "utf8"));

const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === "mock" || f === "node_modules" ? [] : files(p);
    return [".ts", ".tsx"].includes(extname(p)) ? [p] : [];
  });

const PATTERNS = [
  /\bt\(\s*"((?:[^"\\]|\\.)*)"/g,
  /\b(?:required|requiredSelect)\(\s*"([^"]+)"/g,
  /validators\.pattern\([^,]+,\s*"([^"]+)"\)/g,
  /\bmessage = "([^"]+)"/g,
];

const used = new Map(); // key → first file
for (const root of ROOTS)
  for (const file of files(root)) {
    const src = readFileSync(file, "utf8");
    for (const re of PATTERNS) for (const m of src.matchAll(re)) if (!used.has(m[1])) used.set(JSON.parse(`"${m[1]}"`), file);
    // wizard step names: const STEPS = ["Details", …] / REGISTRATION_STEPS / RECOVERY_STEPS
    for (const block of src.matchAll(/STEPS[^=\n]*=\s*(\[[^\]]*\]|\{[^;]*?\};)/g))
      for (const m of block[1].matchAll(/"([A-Z][A-Za-z ]+)"/g)) if (!used.has(m[1])) used.set(m[1], file);
  }

const missing = [...used].filter(([k]) => !(k in AR));
if (missing.length) {
  console.log(`✗ ${missing.length} text(s) missing in ar.json:\n`);
  for (const [k, f] of missing) console.log(`  "${k}"   ← ${f}`);
  process.exit(1);
}
console.log(`✓ All ${used.size} texts have an Arabic translation.`);
