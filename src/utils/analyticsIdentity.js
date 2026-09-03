import { identifyUser } from "./posthogHelpers";

/**
 * Keys this module owns in localStorage. Sign-in writes them; they are read
 * back by capturePostHogEvent to stamp the company level of the
 * post sales -> company -> email hierarchy onto every event.
 */
const CONTEXT_KEYS = [
  "company_id",
  "company_name",
  "organization_id",
  "site_id",
];

const persist = (key, value) => {
  if (value === undefined || value === null || value === "") return;
  localStorage.setItem(key, String(value));
};

/**
 * Attach the PostHog person and persist the company/site context.
 *
 * Every sign-in response (`/users/signin.json`, `/get_otps/verify_otp.json`)
 * already carries company_id, organization_id and site_id on its nested
 * `user` object — there is no need for a separate `user_details/:id.json`
 * round trip (that call could fail silently and leave the context blank).
 * Callers pass that nested `user` object straight through as `details`.
 */
export const establishAnalyticsIdentity = (user = {}, details = {}) => {
  const userId = user.id ?? user.user_id;

  try {
    identifyUser({ ...user, id: userId });
  } catch (err) {
    console.warn("[analytics] identify failed", err);
  }

  persist("company_id", details.company_id);
  persist("company_name", details.company_name ?? details.company?.name);
  persist("organization_id", details.organization_id);
  persist("site_id", details.site_id);
};

/** Drop the analytics-owned context keys. Called on logout. */
export const clearAnalyticsContext = () => {
  CONTEXT_KEYS.forEach((key) => localStorage.removeItem(key));
};
