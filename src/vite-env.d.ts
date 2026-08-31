/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** FM Adoption analytics host. Must NOT be a *-api.panchshil.com host. */
  readonly VITE_FM_ADOPTION_API_URL?: string;
  /** Analytics tenant host, sent as the `url` query param. UAT default. */
  readonly VITE_FM_ADOPTION_TENANT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
