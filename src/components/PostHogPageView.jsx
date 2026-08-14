import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { capturePostHogEvent } from "../utils/posthogHelpers";

/**
 * Fires $pageview on every route change.
 *
 * `capture_pageview` is disabled in main.jsx because this is a SPA — PostHog's
 * automatic pageview only fires on the initial document load, which would
 * report a single pageview for an entire session. Mounted once inside the
 * Router in App.jsx.
 */
export function PostHogPageView() {
  const location = useLocation();

  useEffect(() => {
    capturePostHogEvent("$pageview", {
      $current_url: window.location.href,
    });
  }, [location]);

  return null;
}

export default PostHogPageView;
