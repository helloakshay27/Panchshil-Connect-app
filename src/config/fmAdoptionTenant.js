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
 *   localhost / unknown  -> Panchshil UAT environment
 *                           (apiDomain.js: localhost -> uatapi-connect.panchshil.com)
 *                           -> frontend tenant = uat-connect.panchshil.com
 *   real deployments     -> their own frontend hostname
 *
 * Resolution order (first match wins):
 *   1. VITE_FM_ADOPTION_TENANT_URL — explicit per-deployment override.
 *   2. The frontend hostname serving this deployment. `localhost` (and any
 *      non-browser / unmapped context) maps to the Panchshil UAT FRONTEND host
 *      — never the literal `localhost` host, and never the backend API URL.
 */

/** Panchshil UAT frontend tenant used for local/unmapped environments. */
const DEFAULT_TENANT_URL = "uat-connect.panchshil.com";

function resolveTenantUrl() {
  const fromEnv = (import.meta.env.VITE_FM_ADOPTION_TENANT_URL || "").trim();
  if (fromEnv) return fromEnv;

  const host = (typeof window !== "undefined" && window.location.hostname) || "";

  // Running locally targets the Panchshil UAT environment — same wiring as
  // apiDomain.js mapping localhost -> https://uatapi-connect.panchshil.com/.
  // The analytics tenant is the Panchshil UAT frontend host, not `localhost`.
  if (!host || host === "localhost") return DEFAULT_TENANT_URL;

  // Real deployments: the analytics tenant is the frontend host serving this
  // deployment (Panchshil / Kalpataru / Rustomjee), the same host convention
  // the app keys its environments on in apiDomain.js.
  return host;
}

/** Frontend tenant host sent as the `url` query param on every FM adoption request. */
export const FM_ADOPTION_TENANT_URL = resolveTenantUrl();