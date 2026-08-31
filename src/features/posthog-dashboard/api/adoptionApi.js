import axios from "axios";

/* ---------------------------------------------------------------------------
 * FM Adoption Analytics API client.
 *
 * Base URL : VITE_FM_ADOPTION_API_URL (default https://posthog-api.lockated.com)
 * Tenant   : sent as the `url` query param, from VITE_FM_ADOPTION_TENANT_URL
 * Auth     : the analytics host answers openly (HTTP 200, no auth). A Bearer
 *            interceptor is attached at request time for consistency with the
 *            app's other clients and future-proofing — it only fires when a
 *            token is actually present, and the request still goes out without
 *            one. No static token is ever embedded or put in env.
 * ------------------------------------------------------------------------- */

export const ANALYTICS_BASE_URL =
  import.meta.env.VITE_FM_ADOPTION_API_URL ||
  "https://posthog-api.lockated.com";

export const ANALYTICS_TENANT =
  import.meta.env.VITE_FM_ADOPTION_TENANT_URL || "pulse-uat.panchshil.com";

const analyticsClient = axios.create({
  baseURL: ANALYTICS_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

/* Bearer token attached at REQUEST time, only when present. The read prefers
   the same keys the app's other clients use (see ../pages/baseurl/apiDomain.js
   and the sign-in flow). */
analyticsClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    "";
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Response interceptor: when a backend endpoint returns 404 (or any non-JSON
   like a Rails HTML error page), silently return null instead of throwing so
   React Query treats it as "no data" and the UI falls back to sample/empty
   state — exactly the same graceful degradation pattern the other layers
   (traffic, adoption, workflow) use. */
analyticsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const contentType = error.response?.headers?.["content-type"] || "";
    if (status === 404 || (status >= 400 && !contentType.includes("application/json"))) {
      return Promise.resolve({ data: null });
    }
    return Promise.reject(error);
  },
);

/* ---------------------------------------------------------------------------
 * Query-string builder.
 *
 * `site_id` must be joined with RAW commas in the query string — never
 * percent-encoded to %2C. Axios would encode array values, so we build the
 * query string manually from an ordered list of [key, value] pairs and append
 * it directly to the URL. Non-array string values are kept as-is.
 * ------------------------------------------------------------------------- */

/**
 * @param {Array<[string, string|string[]|number|undefined|null]>} pairs
 */
const buildQuery = (pairs) => {
  const parts = [];
  for (const [key, value] of pairs) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      // join with raw commas, e.g. site_id=2189,2190
      parts.push(`${key}=${value.join(",")}`);
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join("&");
};

/**
 * GET helper: appends a manually built query string (raw commas preserved for
 * site_id) to the endpoint and returns the parsed response.
 */
const get = async (endpoint, pairs) => {
  const qs = buildQuery(pairs);
  const url = `/fm/adoption/${endpoint}${qs ? `?${qs}` : ""}`;
  const { data } = await analyticsClient.get(url);
  return data;
};

/* Shared param slices ---------------------------------------------------- */

const rangeParams = ({ from, to, siteIds, devices } = {}) => [
  ["url", ANALYTICS_TENANT],
  ["from", from],
  ["to", to],
  ["site_id", siteIds],
  ["device_type", devices],
];

const weeklyParams = ({ to, weeks, siteIds, devices } = {}) => [
  ["url", ANALYTICS_TENANT],
  ["to", to],
  ["weeks", weeks],
  ["site_id", siteIds],
  ["device_type", devices],
];

/* Endpoint methods -------------------------------------------------------- */

export const fetchTrafficSession = (filters) =>
  get("traffic_session", rangeParams(filters));

export const fetchUsageAndDistribution = (filters) =>
  get("usage_and_distribution", rangeParams(filters));

export const fetchAdoptionEngagement = (filters) => {
  const { licensedSeats, ...rest } = filters || {};
  const pairs = rangeParams(rest);
  // licensed_seats only when a non-zero positive number is supplied
  if (licensedSeats && Number(licensedSeats) > 0) {
    pairs.push(["licensed_seats", Number(licensedSeats)]);
  }
  return get("adoption_engagement", pairs);
};

export const fetchAdoptionTrend = (filters) =>
  get("adoption_trend", weeklyParams(filters));

export const fetchCrashOverview = (filters) =>
  get("crash_overview", rangeParams(filters));

export const fetchCrashTrend = (filters) => {
  const { days, ...rest } = filters || {};
  const pairs = rangeParams(rest);
  if (days != null) pairs.push(["days", Number(days)]);
  return get("crash_trend", pairs);
};

export const fetchCrashByReleaseAndVariant = (filters) =>
  get("crash_by_release_and_variant", rangeParams(filters));

export const fetchCrashDiagnostics = (filters) =>
  get("crash_diagnostics", rangeParams(filters));

export const fetchCrashHandledFailures = (filters) =>
  get("crash_handled_failures", rangeParams(filters));

export const fetchGrowth = (filters) => get("growth", weeklyParams(filters));

export const fetchRetention = (filters) =>
  get("retention", weeklyParams(filters));

export const fetchRoles = (filters) => get("roles", rangeParams(filters));

export const fetchModules = (filters) => {
  const { module, ...rest } = filters || {};
  const pairs = rangeParams(rest);
  if (module) pairs.push(["module", module]); // top-level tree has no module
  return get("modules", pairs);
};

export const fetchWorkflowUsage = (filters) => {
  const { module, subModule, ...rest } = filters || {};
  const pairs = rangeParams(rest);
  if (module) pairs.push(["module", module]); // defaults server-side
  if (subModule) pairs.push(["sub_module", subModule]);
  return get("workflow_usage", pairs);
};

export default analyticsClient;
