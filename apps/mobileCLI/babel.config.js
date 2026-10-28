/**
 * Same NativeWind + prod console-strip setup as apps/mobile, using the RN CLI
 * babel preset instead of babel-preset-expo. Reanimated's plugin must be last.
 */
module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isProd = process.env.NODE_ENV === "production";

  return {
    presets: [
      ["module:@react-native/babel-preset", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: { "@": "./src" },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowUndefined: true,
          safe: false,
        },
      ],
      ...(isProd ? [require.resolve("babel-plugin-transform-remove-console")] : []),
      "react-native-reanimated/plugin",
    ],
  };
};
