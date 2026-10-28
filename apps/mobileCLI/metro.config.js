/**
 * RN CLI Metro + npm workspaces + NativeWind.
 * packages/shared is consumed as TypeScript source (same as the Expo app).
 */
const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = {
  watchFolders: [
    path.resolve(workspaceRoot, "packages/shared"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],
    extraNodeModules: {
      "@mf-bank/shared": path.resolve(workspaceRoot, "packages/shared"),
    },
    disableHierarchicalLookup: true,
  },
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(projectRoot), config), {
  input: "./global.css",
});
