/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVE_RATES_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
