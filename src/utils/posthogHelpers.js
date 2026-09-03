import posthog from "posthog-js";
import { getTenant } from "./tenant";

const RELEASE_VERSION = import.meta.env.VITE_APP_VERSION ?? "dev";

/**
 * OS-level device info: `{ os: "ios" }` / `{ os: "Android" }` for a known
 * platform, `{ device_type: "mobile" }` for everything else (desktop,
 * tablets, "all", unrecognised UAs). Spread into the PostHog capture props.
 *
 * Pass `dev` explicitly when the caller already knows the platform — e.g. the
 * usage dashboards' All/iOS/Android toggle buttons, which call this with the
 * clicked filter ("all" | "ios" | "android") so the event reflects the
 * selected platform rather than the browser's own user agent. Omit it to
 * fall back to sniffing the current browser's user agent.
 */
export const getDeviceInfo = (dev) => {
  const resolved =
    dev ??
    (() => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      return /iPhone|iPad|iPod/i.test(ua) ? "ios" : /Android/i.test(ua) ? "android" : "";
    })();

  if (resolved === "ios") return { os: "ios" };
  if (resolved === "android") return { os: "Android" };
  return { device_type: "mobile" };
};

/** Read a localStorage value as a number, or undefined when absent/not numeric. */
const numeric = (key) => {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === "" || raw === "null" || raw === "undefined") {
    return undefined;
  }
  return isNaN(Number(raw)) ? undefined : Number(raw);
};

/** Read a localStorage string, or undefined when absent. */
const text = (key) => {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === "" || raw === "null" || raw === "undefined") {
    return undefined;
  }
  return raw;
};

/**
 * Fire a PostHog event with the standard identity context attached.
 *
 * The reporting hierarchy is post sales -> company -> email:
 *   - `project_code` / `tenant` come from the hostname and are always present.
 *   - `company_id`, `organization_id` and `site_id` are written into
 *     localStorage at login straight off the sign-in response's nested
 *     `user` object (see src/utils/analyticsIdentity.js) — no separate
 *     lookup, so they're present whenever the login response carries them.
 *   - `user_id` / `email` are written by every sign-in path.
 *
 * Absent fields are omitted rather than sent as null, so a missing value is
 * never mistaken for a real one in PostHog.
 */
export const capturePostHogEvent = (event, props = {}) => {
  const { tenant, project_code } = getTenant();

  posthog.capture(event, {
    platform: "web",
    ...getDeviceInfo(),
    release_version: RELEASE_VERSION,
    project_id: "P-224",
    project_code,
    tenant,
    company_id: numeric("company_id"),
    company_name: text("company_name"),
    organization_id: numeric("organization_id"),
    site_id: numeric("site_id"),
    user_id: numeric("user_id"),
    email: text("email"),
    role: text("lock_role_name"),
    ...props,
  });
};

/**
 * Fire a Connect (post-sales) product-analytics event.
 *
 * Use this for every custom event in this app — it is the single place an
 * event's standard context is decided.
 */
export const captureConnectEvent = (event, props = {}) =>
  capturePostHogEvent(event, props);

/**
 * Persist the identity fields analytics needs, then attach the PostHog person.
 *
 * Called from the sign-in paths. `posthog.identify` ties the anonymous
 * pre-login session to the real user, so funnels survive the login boundary.
 */
export const identifyUser = (user = {}) => {
  const userId = user.id ?? user.user_id;
  if (userId === undefined || userId === null || userId === "") return;

  posthog.identify(String(userId), {
    email: user.email ?? undefined,
    firstname: user.firstname ?? undefined,
    lastname: user.lastname ?? undefined,
    lock_role_name: user.lock_role_name ?? undefined,
  });
};

/** Detach the person on logout so the next sign-in starts a fresh identity. */
export const resetIdentity = () => posthog.reset();
