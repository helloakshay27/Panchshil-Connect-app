import axios from "axios";
import { baseURL } from "../pages/baseurl/apiDomain";
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
 * Attach the PostHog person and backfill the company context.
 *
 * The sign-in response carries only id/email/name/role, so the company the user
 * belongs to is fetched separately from `user_details/:id.json` — the same
 * endpoint src/pages/user-details.jsx uses, whose `users` payload carries
 * company_id, organization_id and site_id.
 *
 * Deliberately never rejects: analytics context is not worth failing a login
 * over. When the fetch fails, events still carry the hostname-derived `tenant`,
 * which is always present, plus user_id and email.
 */
export const establishAnalyticsIdentity = async (user = {}, token) => {
  const userId = user.id ?? user.user_id;

  try {
    identifyUser({ ...user, id: userId });
  } catch (err) {
    console.warn("[analytics] identify failed", err);
  }

  if (!userId || !token) return;

  try {
    const { data } = await axios.get(`${baseURL}user_details/${userId}.json`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const details = data?.users ?? {};
    persist("company_id", details.company_id);
    persist("company_name", details.company_name ?? details.company?.name);
    persist("organization_id", details.organization_id);
    persist("site_id", details.site_id);
  } catch (err) {
    // Non-fatal by design — see the note above.
    console.warn("[analytics] company context backfill failed", err);
  }
};

/** Drop the analytics-owned context keys. Called on logout. */
export const clearAnalyticsContext = () => {
  CONTEXT_KEYS.forEach((key) => localStorage.removeItem(key));
};
