/**
 * Brand (tenant) resolution for analytics.
 *
 * This app is one codebase deployed under several brands, each on its own
 * hostname — the same switch that `src/pages/baseurl/apiDomain.js` uses to pick
 * the API base URL. Page components are shared across brands, so the brand is
 * carried as an event property rather than being baked into event names.
 *
 * Keep the hosts here in sync with apiDomain.js when a deployment is added.
 */

const TENANTS = {
  panchshil: { tenant: "panchshil", project_code: "PANCHSHIL-01" },
  kalpataru: { tenant: "kalpataru", project_code: "KL-01" },
  rustomjee: { tenant: "rustomjee", project_code: "RJ-01" },
  runwal: { tenant: "runwal", project_code: "RUNWAL-01" },
};

const HOST_MAP = {
  "connect.panchshil.com": TENANTS.panchshil,
  "uat-connect.panchshil.com": TENANTS.panchshil,
  "ui-panchshil-super.lockated.com": TENANTS.panchshil,
  "ui-loyalty-super.lockated.com": TENANTS.panchshil,

  "ui-kalpataru.lockated.com": TENANTS.kalpataru,
  "web-kalpataru.lockated.com": TENANTS.kalpataru,

  "rustomjee.lockated.com": TENANTS.rustomjee,
};

/**
 * The brand serving the current page.
 *
 * Falls back to Panchshil for localhost and any unmapped host, matching the
 * default arm of apiDomain.js — an unknown host is a deployment that has not
 * been registered yet, not a separate brand.
 */
export const getTenant = () => {
  if (typeof window === "undefined") return TENANTS.panchshil;

  const hostname = window.location.hostname;
  if (HOST_MAP[hostname]) return HOST_MAP[hostname];

  // Substring fallbacks so preview/staging subdomains resolve to the right
  // brand instead of silently reporting as Panchshil.
  if (hostname.includes("kalpataru")) return TENANTS.kalpataru;
  if (hostname.includes("rustomjee")) return TENANTS.rustomjee;
  if (hostname.includes("runwal")) return TENANTS.runwal;
  if (hostname.includes("panchshil")) return TENANTS.panchshil;

  return TENANTS.panchshil;
};
