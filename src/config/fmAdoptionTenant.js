/**
 * FM Adoption Analytics — tenant (frontend/domain) configuration.
 *
 * Every `/fm/adoption/*` request carries a `url` query param that identifies
 * the analytics tenant — the FRONTEND host whose PostHog events the API
 * aggregates. This module is the single source of truth for that tenant
 * value, resolved dynamically per environment/deployment so no frontend URL is
 * hardcoded inside API functions or React components (same architecture as the
 * reference usage-analytics dashboard).
 *
 * The host convention mirrors the target app's own frontend deployments and
 * its backend resolution in `src/pages/baseurl/apiDomain.js`:
 *
 *   real deployments  -> their own frontend hostname
 *   localhost/unknown -> resolved via `baseURL` (apiDomain.js), so it always
 *                        matches whichever brand apiDomain.js picked for this
 *                        hostname — e.g. localhost resolves to Rustomjee's
 *                        backend there, so it resolves to Rustomjee's
 *                        frontend tenant here too, not a fixed brand.
 *
 * Resolution order (first match wins):
 *   1. VITE_FM_ADOPTION_TENANT_URL — explicit per-deployment override.
 *   2. The frontend hostname serving this deployment, when it's a real host.
 *   3. `localhost` (and any non-browser/unmapped context): the frontend
 *      tenant for whichever brand `baseURL` resolved to, via BASE_URL_TENANTS
 *      below — never a hardcoded single brand.
 */

import { baseURL } from "../pages/baseurl/apiDomain";

/** Backend baseURL (apiDomain.js) -> the matching frontend tenant host the FM
    adoption analytics API expects. Keyed off baseURL rather than a second,
    independent hostname switch, so this can never drift out of sync with
    which brand apiDomain.js actually picked for the current hostname. */
const BASE_URL_TENANTS = {
  "https://api-connect.panchshil.com/": "connect.panchshil.com",
  "https://uatapi-connect.panchshil.com/": "uat-connect.panchshil.com",
  "https://panchshil-super.lockated.com/": "ui-panchshil-super.lockated.com",
  "https://dev-panchshil-super-app.lockated.com/": "ui-loyalty-super.lockated.com",
  "https://kalpataru.lockated.com/": "ui-kalpataru.lockated.com",
  "https://rustomjee-live.lockated.com/": "rustomjee.lockated.com",
};

/** Panchshil UAT frontend tenant — last-resort fallback if baseURL is ever
    something BASE_URL_TENANTS doesn't recognise. */
const DEFAULT_TENANT_URL = "uat-connect.panchshil.com";

function resolveTenantUrl() {
  const fromEnv = (import.meta.env.VITE_FM_ADOPTION_TENANT_URL || "").trim();
  if (fromEnv) return fromEnv;

  const host = (typeof window !== "undefined" && window.location.hostname) || "";

  // Real deployments: the analytics tenant is the frontend host serving this
  // deployment (Panchshil / Kalpataru / Rustomjee), the same host convention
  // the app keys its environments on in apiDomain.js.
  if (host && host !== "localhost") return host;

  // localhost (and any non-browser/unmapped context): resolve through the
  // same backend baseURL the rest of the app is already using, so the
  // analytics tenant always matches the active brand instead of being
  // hardcoded to Panchshil.
  return BASE_URL_TENANTS[baseURL] || DEFAULT_TENANT_URL;
}

/** Frontend tenant host sent as the `url` query param on every FM adoption request. */
export const FM_ADOPTION_TENANT_URL = resolveTenantUrl();