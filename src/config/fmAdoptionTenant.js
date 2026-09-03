/**
 * FM Adoption Analytics — tenant (backend) configuration.
 *
 * Every `/fm/adoption/*` request carries a `url` query param that identifies
 * the analytics tenant. The FM adoption API expects this to be the app's own
 * BACKEND host — the bare hostname of the same `baseURL` the rest of the app
 * already uses for every other API call (src/pages/baseurl/apiDomain.js),
 * with the protocol and trailing slash stripped (no `https://`, no `/`).
 *
 * Resolution order (first match wins):
 *   1. VITE_FM_ADOPTION_TENANT_URL — explicit per-deployment override.
 *   2. `baseURL` (apiDomain.js), protocol/slash stripped — the backend host
 *      for whichever brand this hostname resolves to.
 */

import { baseURL } from "../pages/baseurl/apiDomain";

function resolveTenantUrl() {
  const fromEnv = (import.meta.env.VITE_FM_ADOPTION_TENANT_URL || "").trim();
  if (fromEnv) return fromEnv;

  // Bare host only — strip the protocol and trailing slash off baseURL,
  // e.g. "https://kalpataru.lockated.com/" -> "kalpataru.lockated.com".
  return baseURL.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/** Backend base URL sent as the `url` query param on every FM adoption request. */
export const FM_ADOPTION_TENANT_URL = resolveTenantUrl();
