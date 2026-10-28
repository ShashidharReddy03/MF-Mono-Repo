import type { FallbackProps } from "react-error-boundary";
import BaseButton from "../base/BaseButton";
import { t } from "@mf-bank/shared";

/** Never shows stack traces to the user */
const ErrorFallback = ({ resetErrorBoundary }: FallbackProps) => (
  <div className="grid min-h-screen place-items-center bg-surface p-6">
    <div className="max-w-sm text-center">
      <h1 className="text-lg font-semibold text-primary">{t("Something went wrong")}</h1>
      <p className="mt-2 text-sm text-muted">
        {t("The page stopped responding. For your security you'll need to sign in again.")}
      </p>
      <BaseButton
        type="primary"
        label={t("Go to login")}
        className="mt-6"
        onClick={() => {
          resetErrorBoundary();
          window.location.assign(import.meta.env.BASE_URL);
        }}
      />
    </div>
  </div>
);

export default ErrorFallback;
