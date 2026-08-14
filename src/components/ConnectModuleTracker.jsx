import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveModule } from "../config/moduleRegistry";
import { captureConnectEvent } from "../utils/posthogHelpers";

/**
 * Fires `Connect Module Viewed` whenever the route lands on an instrumented
 * module, using src/config/moduleRegistry.js.
 *
 * This gives every post-sales and setup module its view event without editing
 * ~130 page files. Pages that can report a meaningful `record_count` fire their
 * own richer event once their list resolves; this one always carries the module
 * identity so coverage never depends on a page having been touched.
 *
 * Mounted once inside the Router in App.jsx, next to PostHogPageView.
 */
export function ConnectModuleTracker() {
  const location = useLocation();

  useEffect(() => {
    const meta = resolveModule(location.pathname);
    if (!meta) return;

    captureConnectEvent("Connect Module Viewed", {
      module: meta.module,
      package: meta.package,
      screen: meta.screen,
      view: meta.view,
    });
  }, [location.pathname]);

  return null;
}

export default ConnectModuleTracker;
