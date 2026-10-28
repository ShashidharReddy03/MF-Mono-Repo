/**
 * Expo's default config already understands npm-workspace monorepos
 * (watches the repo root and resolves hoisted node_modules), so we only
 * add NativeWind. packages/shared is consumed as TypeScript source.
 */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
