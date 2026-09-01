/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** FM Adoption analytics host. Must NOT be a *-api.panchshil.com host. */
  readonly VITE_FM_ADOPTION_API_URL?: string;
  /** Optional override for the analytics tenant (`url` query param). When
   * unset, the tenant is the frontend host serving the deployment, resolved
   * by src/config/fmAdoptionTenant.js (localhost -> Panchshil UAT frontend). */
  readonly VITE_FM_ADOPTION_TENANT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
