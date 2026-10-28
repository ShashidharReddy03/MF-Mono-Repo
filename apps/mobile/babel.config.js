/**
 * - NativeWind v4 (className → styles) via jsxImportSource + its babel preset
 * - Production builds strip every console.* call (demo: logger off in prod)
 * Reanimated/worklets plugin is added automatically by babel-preset-expo.
 *
 * babel-preset-expo is resolved from the installed `expo` package, so it works
 * no matter where npm places it in this monorepo (hoisted or nested under expo).
 */
const expoPreset = require.resolve("babel-preset-expo", {
  paths: [require.resolve("expo/package.json")],
});

module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isProd = process.env.NODE_ENV === "production";

  return {
    presets: [[expoPreset, { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [...(isProd ? [require.resolve("babel-plugin-transform-remove-console")] : [])],
  };
};
