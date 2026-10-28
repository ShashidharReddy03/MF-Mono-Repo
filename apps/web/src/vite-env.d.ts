/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_API_URL: string;
  readonly VITE_RSA_PUBLIC_KEY: string;
  readonly VITE_REQ_SOURCE: string;
  readonly VITE_REQ_SOURCE_ID: string;
  readonly VITE_REQ_LK: string;
  readonly VITE_IDLE_TIMEOUT_MIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
