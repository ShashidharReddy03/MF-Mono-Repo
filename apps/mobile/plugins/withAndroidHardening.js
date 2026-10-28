/**
 * Build-time hardening (applied by `expo prebuild` / `expo run:*` / EAS).
 *
 *  #23 StrandHogg     taskAffinity="" + allowTaskReparenting=false, so a malicious app
 *                     can't slip its activity into MF Bank's task and impersonate it.
 *  #16 Reverse eng.   R8 code shrinking + obfuscation and resource shrinking in release builds
 *                     (JS is already Hermes bytecode; iOS release builds strip symbols).
 *  #15/#29 Blacklist  Android 11+ only lets an app see packages declared in <queries>;
 *                     iOS only answers canOpenURL for schemes in LSApplicationQueriesSchemes.
 *                     Both are generated from security-lists.json.
 *  #18 Tampering      release builds are never debuggable.
 */
const path = require("path");
const { withAndroidManifest, withGradleProperties, withInfoPlist } = require("expo/config-plugins");

const lists = require(path.join(__dirname, "..", "security-lists.json"));
const androidPackages = [...new Set([...lists.blacklistedApps.android, ...lists.remoteAccessApps.android])];
const iosSchemes = [...new Set([...lists.blacklistedApps.ios, ...lists.remoteAccessApps.ios])];

const setGradleProp = (props, key, value) => {
  const existing = props.find((p) => p.type === "property" && p.key === key);
  if (existing) existing.value = value;
  else props.push({ type: "property", key, value });
};

module.exports = function withAndroidHardening(config) {
  config = withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    const app = manifest.application?.[0];
    if (app) {
      app.$["android:taskAffinity"] = "";
      app.$["android:allowTaskReparenting"] = "false";
      for (const activity of app.activity ?? []) {
        if (activity.$["android:name"] === ".MainActivity") {
          activity.$["android:taskAffinity"] = "";
          activity.$["android:allowTaskReparenting"] = "false";
        }
      }
    }
    const queries = (manifest.queries = manifest.queries ?? [{}]);
    const q = queries[0];
    const declared = new Set((q.package ?? []).map((p) => p.$["android:name"]));
    q.package = [
      ...(q.package ?? []),
      ...androidPackages.filter((p) => !declared.has(p)).map((p) => ({ $: { "android:name": p } })),
    ];
    return c;
  });

  config = withGradleProperties(config, (c) => {
    setGradleProp(c.modResults, "android.enableProguardInReleaseBuilds", "true");
    setGradleProp(c.modResults, "android.enableShrinkResourcesInReleaseBuilds", "true");
    return c;
  });

  return withInfoPlist(config, (c) => {
    const current = new Set(c.modResults.LSApplicationQueriesSchemes ?? []);
    iosSchemes.forEach((s) => current.add(s));
    c.modResults.LSApplicationQueriesSchemes = [...current];
    return c;
  });
};
