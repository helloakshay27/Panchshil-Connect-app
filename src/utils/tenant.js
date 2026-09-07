/**
 * Brand (tenant) resolution for analytics.
 *
 * This app is one codebase deployed under several brands. Page components
 * are shared across brands, so the brand is carried as an event property
 * rather than being baked into event names.
 *
 * Resolved from `baseURL` (src/pages/baseurl/apiDomain.js) — the same
 * backend host every other API call in the app already keys off — rather
 * than a second, independent hostname switch. A raw-hostname switch here
 * would drift out of sync with apiDomain.js's own hostname→backend mapping
 * (e.g. apiDomain.js pointing `localhost` at a real brand's backend while
 * this module still fell back to Panchshil for any host it didn't
 * recognise); keying off baseURL means both always agree, including on
 * localhost and any admin-panel alias host that shares a brand's backend.
 *
 * Keep this map in sync with apiDomain.js's `baseURL` switch when a
 * deployment is added.
 */

import { baseURL } from "../pages/baseurl/apiDomain";

const TENANTS = {
  panchshil: { tenant: "panchshil", project_code: "PC-01" },
  kalpataru: { tenant: "kalpataru", project_code: "KL-PS01" },
  rustomjee: { tenant: "rustomjee", project_code: "RC-PS01" },
  runwal: { tenant: "runwal", project_code: "RUNWAL-01" },
};

const BASE_URL_TENANTS = {
  "https://api-connect.panchshil.com/": TENANTS.panchshil,
  "https://uatapi-connect.panchshil.com/": TENANTS.panchshil,
  "https://panchshil-super.lockated.com/": TENANTS.panchshil,
  "https://dev-panchshil-super-app.lockated.com/": TENANTS.panchshil,
  "https://kalpataru.lockated.com/": TENANTS.kalpataru,
  "https://rustomjee-live.lockated.com/": TENANTS.rustomjee,
};

/**
 * The brand serving the current page.
 *
 * Falls back to Panchshil when baseURL is ever something BASE_URL_TENANTS
 * doesn't recognise — an unmapped backend is a deployment that hasn't been
 * registered yet, not a separate brand.
 */
export const getTenant = () => BASE_URL_TENANTS[baseURL] || TENANTS.panchshil;
