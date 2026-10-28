import "./app/bootstrap"; // must run before anything touches @mf-bank/shared
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/500.css";
import "@fontsource/noto-sans-arabic/600.css";
import "@fontsource/noto-sans-arabic/700.css";
import "./index.css";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { store } from "@mf-bank/shared";
import App from "./app/App";
import ErrorFallback from "./shared/ui/components/ErrorFallback";
import { installBrowserGuards } from "./core/security/browserGuards";

// clickjacking / non-HTTPS / CSP guards — the app does not start if they fail
if (installBrowserGuards()) createRoot(document.getElementById("root")!).render(
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error) => {
      if (!import.meta.env.PROD) console.error(error);
    }}
  >
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>,
);
