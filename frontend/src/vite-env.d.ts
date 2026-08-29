/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAS_DEPLOYMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}