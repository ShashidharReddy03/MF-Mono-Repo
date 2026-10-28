import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import obfuscator from "vite-plugin-bundle-obfuscator";

/**
 * Injects a Content-Security-Policy <meta> in BUILD output only
 * (dev needs inline scripts for React Fast Refresh).
 * NOTE: also send CSP + frame-ancestors + HSTS as real HTTP headers from
 * your web server — some directives are ignored in <meta>.
 */
const cspPlugin = (apiUrl: string): Plugin => ({
  name: "mf-csp",
  apply: "build",
  transformIndexHtml(html) {
    let apiOrigin = "";
    try {
      apiOrigin = new URL(apiUrl).origin;
    } catch {
      /* relative URL → same origin */
    }
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // antd CSS-in-JS
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src 'self' ${apiOrigin}`.trim(),
      "object-src 'none'",
      "frame-src 'none'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "media-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      // frame-ancestors, HSTS etc. can't be set from a <meta> tag — see deploy/
    ].join("; ");
    return html.replace(
      "<head>",
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
    );
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [
      react(),
      cspPlugin(env.VITE_API_URL ?? ""),
      // Same obfuscation settings as the demo project (build only)
      obfuscator({
        enable: true,
        apply: "build",
        log: false,
        autoExcludeNodeModules: true,
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          simplify: true,
          numbersToExpressions: true,
          stringArray: true,
          stringArrayEncoding: ["base64"],
          stringArrayThreshold: 0.75,
          renameGlobals: false,
          disableConsoleOutput: true,
        },
      }),
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
      dedupe: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
    },
    build: {
      sourcemap: false, // never ship source maps
    },
    server: {
      port: 5173,
      // Use VITE_API_URL=/api/... in .env.development to route through this
      // proxy and avoid CORS against the UAT server.
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET || "https://ibuat.scu.sc:8081/",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
