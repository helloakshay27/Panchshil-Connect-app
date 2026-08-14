import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { resolveModule } from "../config/moduleRegistry";
import { captureConnectEvent } from "../utils/posthogHelpers";

/**
 * Event/property contract for the Connect (post-sales) app.
 *
 * One named handler per event, so an event name and its property shape are
 * declared exactly once and callers never type a raw string. Event names are
 * frozen once shipped — dashboards resolve against them; properties are
 * additive only.
 *
 * `module` is a property on every event rather than part of the name: that
 * keeps "which modules get used?" one breakdown instead of ~40 event names.
 * It is resolved automatically from the current route via
 * src/config/moduleRegistry.js, so call sites never repeat it and page events
 * can never drift from the registry-driven view events. Pass an explicit
 * `module` only when firing on behalf of a route you are not on.
 *
 * Fire these only from success branches, after the API confirms — never
 * optimistically on click, or the numbers count intent rather than outcome.
 */
export function useConnectEvents() {
  const { pathname } = useLocation();

  return useMemo(() => {
    const meta = resolveModule(pathname);

    /** Merge the route's module context under any explicit overrides. */
    const withModule = (props = {}) => ({
      module: meta?.module,
      package: meta?.package,
      screen: meta?.screen,
      ...props,
    });

    return {
      /**
       * How many rows a list actually resolved to. Call once, after the first
       * successful fetch.
       *
       * Deliberately NOT "Connect Module Viewed" — ConnectModuleTracker is the
       * single source of view events, and emitting that name from here too
       * would double-count every visit to an instrumented list page.
       */
      onModuleLoaded: (props = {}) =>
        captureConnectEvent("Connect Module Loaded", withModule(props)),

      /** Create and edit share one event; `mode` separates them. */
      onRecordSaved: (props = {}) =>
        captureConnectEvent("Connect Record Saved", withModule(props)),

      onRecordDeleted: (props = {}) =>
        captureConnectEvent("Connect Record Deleted", withModule(props)),

      onRecordStatusChanged: (props = {}) =>
        captureConnectEvent("Connect Record Status Changed", withModule(props)),

      /**
       * Call after the search response lands — `result_count` must describe
       * this query, not the previous render's rows.
       */
      onModuleSearched: ({ query, result_count, ...rest } = {}) =>
        captureConnectEvent(
          "Connect Module Searched",
          withModule({
            query_length: (query ?? "").trim().length,
            result_count,
            returned_zero: result_count === 0,
            ...rest,
          })
        ),

      /** Fires on set *and* on clear, so filter abandonment stays measurable. */
      onModuleFiltered: ({ filters_used = [], ...rest } = {}) =>
        captureConnectEvent(
          "Connect Module Filtered",
          withModule({
            filters_used,
            filter_count: filters_used.length,
            cleared: filters_used.length === 0,
            ...rest,
          })
        ),

      onModulePaginated: (props = {}) =>
        captureConnectEvent("Connect Module Paginated", withModule(props)),

      /** Which required fields blocked a submit — shows where forms hurt. */
      onFormValidationFailed: ({ fields = [], ...rest } = {}) =>
        captureConnectEvent(
          "Connect Form Validation Failed",
          withModule({ fields, field_count: fields.length, ...rest })
        ),

      /* ── Auth ──────────────────────────────────────────────────────────── */

      onLoginSucceeded: ({ method } = {}) =>
        captureConnectEvent("Connect Login Succeeded", { method }),

      onLoginFailed: ({ method, reason } = {}) =>
        captureConnectEvent("Connect Login Failed", { method, reason }),

      onLogout: () => captureConnectEvent("Connect Logout"),
    };
  }, [pathname]);
}

export default useConnectEvents;
