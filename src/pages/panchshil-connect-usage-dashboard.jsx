import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LOGO_URL } from "./baseurl/apiDomain";
import {
  ChartCard,
  SectionHead,
  StatTile,
  MetricCard,
  AreaChart,
  DonutChart,
  HBar,
  StackedShareBar,
  VIZ,
} from "../components/dashboard/DashboardCharts";
import {
  useTrafficSession,
  useUsageAndDistribution,
  useAdoptionEngagement,
  useAdoptionTrend,
  useGrowth,
  useRetention,
  useRoles,
  useModuleTree,
  useWorkflowUsage,
  useCrashOverview,
  useCrashTrend,
  useCrashByReleaseAndVariant,
  useCrashDiagnostics,
  useCrashHandledFailures,
} from "../features/posthog-dashboard/api/queries";
import {
  DEFAULT_WINDOW,
  GROWTH_WEEKS,
  RETENTION_WEEKS,
  TREND_WEEKS,
  rangeForDays,
} from "../features/posthog-dashboard/data/constants";
import {
  buildAdopt,
  buildAdoptionTrend,
  buildFlows,
  buildGrowth,
  buildRetention,
  buildRoles,
  buildTraffic,
  buildUsage,
  buildCrashOverview,
  buildCrashTrend,
  buildCrashByReleaseAndVariant,
  buildCrashDiagnostics,
  buildCrashHandledFailures,
} from "../features/posthog-dashboard/data/metrics";
import "./panchshil-connect-dashboard.css";
import "./panchshil-connect-usage-dashboard.css";

/* A tile whose value is already a formatted string (e.g. "94%", "1.0.6 (8)"),
   unlike DashboardCharts' StatTile which always runs the value through
   Intl.NumberFormat. Same markup/classes, so it looks identical. */
const Tile = ({ label, value, sub }) => (
  <div className="pcd-tile">
    <div className="pcd-tile-label">{label}</div>
    <div className="pcd-tile-value">{value}</div>
    {sub ? <div className="pcd-tile-sub">{sub}</div> : null}
  </div>
);

/* Horizontal bars for values that are already percentages (0-100), so the
   bar width is the value itself rather than value-over-peak. */
const PercentHBar = ({ rows, color = VIZ.brand }) => (
  <ul className="pcd-hbar">
    {rows.map((r) => (
      <li key={r.label} title={`${r.label}: ${r.value}%`}>
        <span className="pcd-hbar-label" title={r.label}>
          {r.label}
        </span>
        <span className="pcd-hbar-track">
          <span
            className="pcd-hbar-fill"
            style={{
              width: `${Math.max(r.value, 1.5)}%`,
              background: r.color || color,
            }}
          />
        </span>
        <span className="pcd-hbar-value">{r.value}%</span>
      </li>
    ))}
  </ul>
);

const SampleNote = ({ children }) => <div className="pcd-note">{children}</div>;

/* The four analytics layers, in the same order as the FM Matrix v3
   wireframe this page is modelled on. */
const LAYERS = [
  {
    key: "traffic",
    label: "Traffic & Session",
    sub: "Monitor overall application traffic, resident activity, and session behavior.",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.4 12.6 6.6 7.4l3.4 3.1 4.1-5.4 3.5 4.3" />
        <path d="M2.4 16.4h15.2" />
      </svg>
    ),
  },
  {
    key: "adoption",
    label: "Adoption & Engagement",
    sub: "Measure how effectively residents adopt and engage with the app's major modules, and whether they keep coming back.",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7.6" cy="6.8" r="2.9" />
        <path d="M2.6 16.6c0-2.7 2.2-4.6 5-4.6s5 1.9 5 4.6" />
        <path d="M13.4 4.3a2.9 2.9 0 0 1 0 5.4M14.6 12.4c1.8.5 3 1.9 3 4.2" />
      </svg>
    ),
  },
  {
    key: "workflow",
    label: "Workflow Usage",
    sub: "Resident completion of key business workflows per module, all-modules comparison, and where residents navigate & exit.",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2.4 17.4 6 10 9.6 2.6 6Z" />
        <path d="M2.6 10 10 13.6 17.4 10" />
        <path d="M2.6 14 10 17.6 17.4 14" />
      </svg>
    ),
  },
  {
    key: "stability",
    label: "App Stability",
    sub: "Crash rates and the issues actually causing residents to drop out mid-session.",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2.6 3 16.4h14L10 2.6Z" />
        <path d="M10 8v3.6M10 14.2v.1" />
      </svg>
    ),
  },
];

/* =====================================================================
   Sample / illustrative data. Nothing on this page is wired to a real
   analytics endpoint yet (unlike the Engagement Dashboard it links back
   to, which is fully live) — every number below is a stand-in, sized to
   look plausible for an early-stage resident app, until PostHog / GA4 /
   Crashlytics are wired in for real.
   ===================================================================== */

/* ---------------- Traffic & Session ---------------- */
const TRAFFIC_TILES = [
  { label: "Active Users", value: 108, sub: "Last 28 days" },
  { label: "Screen Views", value: 243, sub: "Last 28 days" },
  { label: "Total Sessions", value: 176, sub: "Last 28 days" },
  { label: "New Users", value: 40, sub: "Last 28 days" },
  { label: "Bounce Rate", value: 18, sub: "% of sessions" },
  { label: "Recently Online", value: 6, sub: "Active in last 30 min" },
];

const ACTIVE_USERS_TREND = [
  { label: "Jul 22", count: 52 },
  { label: "Jul 23", count: 58 },
  { label: "Jul 24", count: 61 },
  { label: "Jul 25", count: 49 },
  { label: "Jul 26", count: 66 },
  { label: "Jul 27", count: 71 },
  { label: "Jul 28", count: 64 },
  { label: "Jul 29", count: 69 },
  { label: "Jul 30", count: 75 },
  { label: "Jul 31", count: 80 },
  { label: "Aug 1", count: 73 },
  { label: "Aug 2", count: 78 },
  { label: "Aug 3", count: 85 },
  { label: "Aug 4", count: 91 },
  { label: "Aug 5", count: 88 },
  { label: "Aug 6", count: 94 },
  { label: "Aug 7", count: 99 },
  { label: "Aug 8", count: 90 },
  { label: "Aug 9", count: 96 },
  { label: "Aug 10", count: 101 },
  { label: "Aug 11", count: 97 },
  { label: "Aug 12", count: 104 },
  { label: "Aug 13", count: 108 },
  { label: "Aug 14", count: 102 },
];

const DEVICE_SPLIT = [
  { label: "Android", value: 67.6 },
  { label: "iOS", value: 32.4 },
];

/* ---------------- Adoption & Engagement ---------------- */
const REGISTERED_RESIDENTS = 450; // estimated ceiling, matches the source wireframe

const ADOPTION_TILES = [
  {
    label: "Seat Utilisation",
    value: "24%",
    sub: "active ÷ registered residents",
  },
  { label: "Stickiness", value: "26%", sub: "avg DAU / MAU" },
  {
    label: "Adoption Trend",
    value: "+7%",
    sub: "vs prior 8 weeks · weekly actives",
  },
  { label: "14-Day Activation", value: "33%", sub: "of new registrations" },
  {
    label: "Module Breadth",
    value: "13 / 20",
    sub: "modules used this period",
  },
];

const ADOPTION_TREND = [
  { label: "W1", count: 62 },
  { label: "W2", count: 66 },
  { label: "W3", count: 69 },
  { label: "W4", count: 73 },
  { label: "W5", count: 76 },
  { label: "W6", count: 80 },
  { label: "W7", count: 84 },
  { label: "W8", count: 89 },
];

const GROWTH_ACCOUNTING = [
  { label: "New", value: 14 },
  { label: "Returning", value: 52 },
  { label: "Resurrecting", value: 4 },
  { label: "Dormant", value: 12 },
];

const ROLE_SPLIT = [
  { label: "Sales / CRM Team", value: 71 },
  { label: "CX / Support Team", value: 58 },
  { label: "Marketing Team", value: 44 },
  { label: "Residents (all)", value: 51 },
];

const COHORT_ROWS = [
  { date: "7/15", cells: [100, 58, 44, 36, 30, 26] },
  { date: "7/22", cells: [100, 61, 47, 38, 32, null] },
  { date: "7/29", cells: [100, 63, 49, 40, null, null] },
  { date: "8/5", cells: [100, 65, 51, null, null, null] },
  { date: "8/12", cells: [100, 68, null, null, null, null] },
  { date: "8/19", cells: [100, null, null, null, null, null] },
];

const cohortColor = (v) => {
  const i = Math.min(
    VIZ.ramp.length - 1,
    Math.max(1, Math.ceil((v / 100) * (VIZ.ramp.length - 1))),
  );
  return VIZ.ramp[i];
};

const SITE_WISE = [
  {
    project: "Panchshil Towers – Kharadi",
    active: 58,
    sessions: 102,
    avgSession: "2.6m",
    bounce: 17,
    trend: "up",
    status: "Healthy",
  },
  {
    project: "Panchshil Business Park – Yerwada",
    active: 41,
    sessions: 74,
    avgSession: "2.1m",
    bounce: 22,
    trend: "flat",
    status: "Steady",
  },
  {
    project: "Panchshil Residency – Hinjewadi",
    active: 33,
    sessions: 55,
    avgSession: "1.9m",
    bounce: 26,
    trend: "up",
    status: "Steady",
  },
  {
    project: "Panchshil Greens – Bavdhan",
    active: 19,
    sessions: 29,
    avgSession: "1.6m",
    bounce: 31,
    trend: "dn",
    status: "Watch",
  },
];
const statusClass = {
  Healthy: "pcd-cell-on",
  Steady: "pcd-cell-neutral",
  Watch: "pcd-cell-bad",
};
const trendArrow = { up: "↗", flat: "→", dn: "↘" };

/* ---------------- Workflow Usage ---------------- */
/* Module names and event-step names are real, from the PostHog event catalogue;
   adoption / completion / drop-off figures are illustrative. */
const WORKFLOWS = [
  {
    key: "auth",
    name: "Auth & Onboarding",
    bucket: "Access",
    steps: [
      "splash_viewed",
      "login_screen_viewed",
      "auth_otp_requested",
      "otp_screen_viewed",
      "auth_otp_verified_success",
      "auth_login_success",
    ],
    adoption: 94,
    completionRate: 85,
    completions: 92,
  },
  {
    key: "home",
    name: "Home Dashboard",
    bucket: "Access",
    steps: [
      "home_page_viewed",
      "home_banner_viewed",
      "home_banner_tapped",
      "home_quick_action_tapped",
      "home_section_viewed",
    ],
    adoption: 82,
    completionRate: 71,
    completions: 71,
  },
  {
    key: "connect",
    name: "Panchshil Connect",
    bucket: "Access",
    steps: [
      "connect_tab_viewed",
      "home_tab_viewed",
      "connect_section_tapped",
      "connect_banner_tapped",
      "bottom_nav_tapped",
    ],
    adoption: 64,
    completionRate: 60,
    completions: 44,
  },
  {
    key: "switcher",
    name: "Project Switcher",
    bucket: "Access",
    steps: ["project_selection_viewed", "project_switched"],
    adoption: 88,
    completionRate: 81,
    completions: 58,
  },
  {
    key: "profile",
    name: "Profile & Settings",
    bucket: "Access",
    steps: ["profile_viewed", "profile_edit_opened", "profile_updated"],
    adoption: 42,
    completionRate: 66,
    completions: 27,
  },
  {
    key: "account",
    name: "My Account & Financials",
    bucket: "Account & Money",
    steps: [
      "account_overview_viewed",
      "booking_details_viewed",
      "demand_letter_viewed",
      "payment_status_checked",
      "ncf_accepted",
      "stamp_duty_viewed",
    ],
    adoption: 71,
    completionRate: 44,
    completions: 34,
  },
  {
    key: "applicant",
    name: "Primary Applicant",
    bucket: "Account & Money",
    steps: ["primary_applicant_viewed", "primary_applicant_section_expanded"],
    adoption: 31,
    completionRate: 69,
    completions: 19,
  },
  {
    key: "projects",
    name: "Projects & Explore",
    bucket: "Discovery",
    steps: [
      "projects_list_viewed",
      "project_details_viewed",
      "project_gallery_viewed",
      "project_brochure_opened",
      "project_enquire_now_tapped",
    ],
    adoption: 71,
    completionRate: 29,
    completions: 21,
  },
  {
    key: "sitevisit",
    name: "Site Visits",
    bucket: "Discovery",
    steps: [
      "create_site_visit_opened",
      "site_visit_project_selected",
      "site_visit_date_selected",
      "site_visit_time_slot_selected",
      "site_visit_booked",
    ],
    adoption: 29,
    completionRate: 52,
    completions: 16,
  },
  {
    key: "referral",
    name: "Referral Program",
    bucket: "Discovery",
    steps: [
      "referral_program_viewed",
      "referral_form_opened",
      "referral_contact_picked",
      "referral_submitted_success",
    ],
    adoption: 17,
    completionRate: 41,
    completions: 7,
  },
  {
    key: "docs",
    name: "My Documents",
    bucket: "Support & Docs",
    steps: [
      "document_hub_viewed",
      "document_category_opened",
      "document_viewed",
      "document_downloaded",
    ],
    adoption: 58,
    completionRate: 74,
    completions: 46,
  },
  {
    key: "servicereq",
    name: "Service Requests",
    bucket: "Support & Docs",
    steps: [
      "service_request_list_viewed",
      "service_request_create_opened",
      "service_request_category_selected",
      "service_request_submit_tapped",
      "service_request_created_success",
    ],
    adoption: 49,
    completionRate: 63,
    completions: 33,
  },
  {
    key: "supportfaq",
    name: "Support, FAQ & Contact",
    bucket: "Support & Docs",
    steps: ["support_hub_viewed", "faq_list_viewed", "contact_us_viewed"],
    adoption: 38,
    completionRate: 47,
    completions: 20,
  },
  {
    key: "privilege",
    name: "Privilege & Concierge",
    bucket: "Engagement",
    steps: [
      "privilege_categories_viewed",
      "privilege_category_opened",
      "privilege_offer_details_viewed",
      "privilege_offer_claimed",
    ],
    adoption: 34,
    completionRate: 33,
    completions: 12,
  },
  {
    key: "events",
    name: "Resident Events",
    bucket: "Engagement",
    steps: [
      "event_list_viewed",
      "event_details_viewed",
      "event_rsvp_confirmed",
    ],
    adoption: 21,
    completionRate: 57,
    completions: 13,
  },
];
const WF_BUCKETS = [...new Set(WORKFLOWS.map((w) => w.bucket))];

const TOP_ENTRY_SCREENS = [
  { screen: "main_home", visitors: 81, views: 146, bounce: 13 },
  { screen: "login", visitors: 29, views: 52, bounce: 24 },
  { screen: "notifications", visitors: 11, views: 20, bounce: 28 },
  { screen: "my_documents", visitors: 10, views: 18, bounce: 28 },
  { screen: "project_details", visitors: 8, views: 15, bounce: 28 },
];

/* ---------------- App Stability ---------------- */
const CRASH_TILES = [
  {
    label: "Crash-Free Users",
    value: "97.8%",
    sub: "last 90 days, latest release",
  },
  {
    label: "Crash-Free Sessions",
    value: "98.4%",
    sub: "last 90 days, latest release",
  },
  { label: "Total Crashes", value: "12", sub: "last 90 days, all releases" },
  {
    label: "Affected Users",
    value: "9",
    sub: "distinct users who hit a crash",
  },
  {
    label: "Latest Release",
    value: "1.0.6 (8)",
    sub: "com.lockated.resident_panchshil",
  },
];

const CRASH_FREE_USERS_TREND = [
  { label: "Aug 8", count: 96.4 },
  { label: "Aug 9", count: 97.1 },
  { label: "Aug 10", count: 96.8 },
  { label: "Aug 11", count: 97.6 },
  { label: "Aug 12", count: 98.0 },
  { label: "Aug 13", count: 97.5 },
  { label: "Aug 14", count: 98.2 },
];
const CRASH_FREE_SESSIONS_TREND = [
  { label: "Aug 8", count: 97.2 },
  { label: "Aug 9", count: 97.9 },
  { label: "Aug 10", count: 97.5 },
  { label: "Aug 11", count: 98.1 },
  { label: "Aug 12", count: 98.5 },
  { label: "Aug 13", count: 98.0 },
  { label: "Aug 14", count: 98.7 },
];

const CRASH_ISSUES = [
  {
    issue: "new MultiImageStreamCompleter.<fn>",
    sub: "FlutterError/HttpException on image load failure — CDN asset socket abort",
    version: "1.0.6",
    events: 5,
    users: 3,
    tag: "Repetitive",
  },
  {
    issue: "CarouselSliderState.build.<fn>",
    sub: "RangeError (invalid length)",
    version: "1.0.6",
    events: 3,
    users: 2,
  },
  {
    issue: "new _VideoProgressIndicatorState.<fn>",
    sub: "setState/markNeedsBuild error",
    version: "1.0.6",
    events: 2,
    users: 1,
  },
  {
    issue: "BuildOwner.finalizeTree.<fn>",
    sub: "Duplicate GlobalKeys",
    version: "1.0.6",
    events: 1,
    users: 1,
  },
  {
    issue: "_TabBarState._handleTabControllerAnimationTick",
    sub: "Null check operator used on a null value",
    version: "1.0.6",
    events: 1,
    users: 1,
  },
];

const CRASH_VARIANTS = [
  { label: "Android — com.lockated.resident_panchshil", value: 97.8 },
  { label: "iOS — com.panchshil.connect (live)", value: 98.9 },
  {
    label: "iOS — legacy bundle (stale, no traffic)",
    value: 81.2,
    color: VIZ.brand2,
  },
];

const HEALTH_TILES = [
  {
    label: "API Timeout Rate",
    value: "2.6%",
    sub: "api_timeout ÷ all API calls",
  },
  {
    label: "Offline-Blocked Actions",
    value: "47",
    sub: "offline_action_blocked, last 90 days",
  },
  {
    label: "Rooted / Jailbroken Devices",
    value: "4",
    sub: "root_detection_triggered, distinct devices",
  },
  {
    label: "Slow API Response (p90)",
    value: "1,860 ms",
    sub: "slow_api_response, duration_ms",
  },
];

const FAILURES_BY_MODULE = [
  { key: "news", label: "News & Press", value: 6 },
  { key: "switcher", label: "Project Switcher", value: 9 },
  { key: "referral", label: "Referral Program", value: 12 },
  { key: "sitevisit", label: "Site Visits", value: 15 },
  { key: "docs", label: "My Documents", value: 18 },
  { key: "servicereq", label: "Service Requests", value: 22 },
  { key: "account", label: "My Account & Financials", value: 31 },
];

const PanchshilConnectUsageDashboard = () => {
  const [layer, setLayer] = useState("traffic");
  const [wfKey, setWfKey] = useState("auth");
  const [crashSearch, setCrashSearch] = useState("");
  const rangeFilters = useMemo(() => rangeForDays(DEFAULT_WINDOW), []);
  const crashTrendFilters = useMemo(
    () => ({ ...rangeFilters, days: 7 }),
    [rangeFilters],
  );
  const trendFilters = useMemo(
    () => ({ to: rangeFilters.to, weeks: TREND_WEEKS }),
    [rangeFilters.to],
  );
  const growthFilters = useMemo(
    () => ({ to: rangeFilters.to, weeks: GROWTH_WEEKS }),
    [rangeFilters.to],
  );
  const retentionFilters = useMemo(
    () => ({ to: rangeFilters.to, weeks: RETENTION_WEEKS }),
    [rangeFilters.to],
  );

  // Keep the established sidebar UI intact while issuing the same analytics
  // requests as the live dashboard whenever its matching layer is opened.
  const trafficQuery = useTrafficSession(rangeFilters, {
    enabled: layer === "traffic",
  });
  const usageQuery = useUsageAndDistribution(rangeFilters, {
    enabled: layer === "traffic",
  });
  const adoptionQuery = useAdoptionEngagement(rangeFilters, {
    enabled: layer === "adoption",
  });
  const adoptionTrendQuery = useAdoptionTrend(trendFilters, {
    enabled: layer === "adoption",
  });
  const growthQuery = useGrowth(growthFilters, {
    enabled: layer === "adoption",
  });
  const retentionQuery = useRetention(retentionFilters, {
    enabled: layer === "adoption",
  });
  const rolesQuery = useRoles(rangeFilters, { enabled: layer === "adoption" });
  const moduleQuery = useModuleTree(rangeFilters, {
    enabled: layer === "adoption" || layer === "workflow",
  });
  const workflowQuery = useWorkflowUsage(rangeFilters, {
    enabled: layer === "workflow",
  });
  const crashOverviewQuery = useCrashOverview(rangeFilters, {
    enabled: layer === "stability",
  });
  const crashTrendQuery = useCrashTrend(crashTrendFilters, {
    enabled: layer === "stability",
  });
  const crashReleaseQuery = useCrashByReleaseAndVariant(rangeFilters, {
    enabled: layer === "stability",
  });
  const crashDiagnosticsQuery = useCrashDiagnostics(rangeFilters, {
    enabled: layer === "stability",
  });
  const crashHandledFailuresQuery = useCrashHandledFailures(rangeFilters, {
    enabled: layer === "stability",
  });

  const traffic = useMemo(
    () => buildTraffic(trafficQuery.data || {}),
    [trafficQuery.data],
  );
  const usage = useMemo(
    () => buildUsage(usageQuery.data || {}),
    [usageQuery.data],
  );
  const adoption = useMemo(
    () => buildAdopt(adoptionQuery.data || {}),
    [adoptionQuery.data],
  );
  const adoptionTrend = useMemo(
    () => buildAdoptionTrend(adoptionTrendQuery.data || {}),
    [adoptionTrendQuery.data],
  );
  const growth = useMemo(
    () => buildGrowth(growthQuery.data || {}),
    [growthQuery.data],
  );
  const retention = useMemo(
    () => buildRetention(retentionQuery.data || {}),
    [retentionQuery.data],
  );
  const roles = useMemo(
    () => buildRoles(rolesQuery.data || {}),
    [rolesQuery.data],
  );
  const liveWorkflow = useMemo(
    () => buildFlows(workflowQuery.data || {}),
    [workflowQuery.data],
  );
  const crashOverview = useMemo(
    () => buildCrashOverview(crashOverviewQuery.data || {}),
    [crashOverviewQuery.data],
  );
  const crashTrend = useMemo(
    () => buildCrashTrend(crashTrendQuery.data || {}),
    [crashTrendQuery.data],
  );
  const crashByRelease = useMemo(
    () => buildCrashByReleaseAndVariant(crashReleaseQuery.data || {}),
    [crashReleaseQuery.data],
  );
  const crashDiagnostics = useMemo(
    () => buildCrashDiagnostics(crashDiagnosticsQuery.data || {}),
    [crashDiagnosticsQuery.data],
  );
  const crashHandledFailures = useMemo(
    () => buildCrashHandledFailures(crashHandledFailuresQuery.data || {}),
    [crashHandledFailuresQuery.data],
  );

  const trafficTiles = useMemo(() => {
    if (!trafficQuery.data) return TRAFFIC_TILES;
    return [
      ...traffic.tiles.map((tile) => ({
        label: tile.label,
        value: tile.value,
        sub: tile.caption || "Selected period",
      })),
      {
        label: "Recently Online",
        value: traffic.recentlyOnline,
        sub: "Active in last 30 min",
      },
    ];
  }, [traffic, trafficQuery.data]);

  const trafficTrend = useMemo(
    () =>
      usageQuery.data
        ? usage.daily.map((day) => ({
            label: day.day,
            count: day.current.visitors,
          }))
        : ACTIVE_USERS_TREND,
    [usage, usageQuery.data],
  );

  const deviceSplit = useMemo(
    () =>
      usageQuery.data
        ? usage.devices.map((device) => ({
            label: device.label,
            value: device.share || 0,
          }))
        : DEVICE_SPLIT,
    [usage, usageQuery.data],
  );

  const adoptionTiles = useMemo(() => {
    if (!adoptionQuery.data) return ADOPTION_TILES;
    return [
      {
        label: adoption.seat.label,
        value: adoption.seat.display,
        sub: adoption.seat.sub,
      },
      {
        label: adoption.stickiness.label,
        value: adoption.stickiness.display,
        sub: adoption.stickiness.sub,
      },
      {
        label: adoption.adoptionTrend.label,
        value: adoption.adoptionTrend.display,
        sub: adoption.adoptionTrend.sub,
      },
      {
        label: adoption.activation.label,
        value: adoption.activation.display,
        sub: adoption.activation.sub,
      },
      {
        label: adoption.moduleBreadth.label,
        value: adoption.moduleBreadth.display,
        sub: "modules used this period",
      },
    ];
  }, [adoption, adoptionQuery.data]);

  const retentionRows = useMemo(
    () =>
      retentionQuery.data
        ? retention.cohorts.map((row) => ({
            date: row.cohort_week,
            cells: [0, 1, 2, 3, 4, 5].map((week) => row[`week${week}`] ?? null),
          }))
        : COHORT_ROWS,
    [retention, retentionQuery.data],
  );

  const current = LAYERS.find((l) => l.key === layer);

  const wf = WORKFLOWS.find((w) => w.key === wfKey) || WORKFLOWS[0];
  const wfBucket = wf.bucket;
  const wfMods = WORKFLOWS.filter((w) => w.bucket === wfBucket);

  const sampleFunnelSteps = useMemo(() => {
    const n = wf.steps.length;
    return wf.steps
      .map((s, i) => {
        const retained = Math.round(
          100 - (i * (100 - wf.completionRate)) / (n - 1 || 1),
        );
        const drop = i > 0 ? null : null;
        return { step: s, retained };
      })
      .map((row, i, arr) => ({
        ...row,
        drop: i > 0 ? arr[i - 1].retained - row.retained : null,
      }));
  }, [wf]);

  const sampleScreenRows = useMemo(
    () =>
      sampleFunnelSteps.map((row, i) => {
        const users = Math.max(
          1,
          Math.round((wf.completions * row.retained) / 100),
        );
        return {
          screen: row.step,
          users,
          events: Math.round(users * 1.4),
          sessions: Math.round(users * 0.9),
          completion: row.retained,
        };
      }),
    [sampleFunnelSteps, wf],
  );

  const funnelSteps = workflowQuery.data
    ? liveWorkflow.funnel
    : sampleFunnelSteps;
  const screenRows = workflowQuery.data
    ? liveWorkflow.flows.map((flow) => ({
        screen: flow.path,
        users: flow.users,
        events: flow.events,
        sessions: flow.sessions,
        completion: flow.fComp,
      }))
    : sampleScreenRows;
  const entryScreens = workflowQuery.data
    ? liveWorkflow.entryScreens.map((screen) => ({
        screen: screen.path,
        visitors: screen.visitors,
        views: screen.views,
        bounce: screen.bounce,
      }))
    : TOP_ENTRY_SCREENS;
  const moduleRows = moduleQuery.data ? moduleQuery.data.tree || [] : SITE_WISE;

  const stabilityTiles = useMemo(() => {
    if (!crashOverviewQuery.data) return CRASH_TILES;
    return crashOverview.tiles;
  }, [crashOverviewQuery.data, crashOverview.tiles]);

  const crashUsersTrend = useMemo(
    () => (crashTrendQuery.data ? crashTrend.users : CRASH_FREE_USERS_TREND),
    [crashTrendQuery.data, crashTrend.users],
  );

  const crashSessionsTrend = useMemo(
    () =>
      crashTrendQuery.data ? crashTrend.sessions : CRASH_FREE_SESSIONS_TREND,
    [crashTrendQuery.data, crashTrend.sessions],
  );

  const crashIssues = useMemo(
    () => (crashDiagnosticsQuery.data ? crashDiagnostics.issues : CRASH_ISSUES),
    [crashDiagnosticsQuery.data, crashDiagnostics.issues],
  );

  const crashReleaseRows = useMemo(
    () =>
      crashReleaseQuery.data
        ? crashByRelease.byRelease
        : [{ key: "1.0.6", label: "1.0.6 (8)", value: 12 }],
    [crashReleaseQuery.data, crashByRelease.byRelease],
  );

  const crashVariantRows = useMemo(
    () =>
      crashReleaseQuery.data
        ? crashByRelease.variants.map((row) => ({
            label: row.label,
            value: row.value,
            color: row.color || VIZ.brand3,
          }))
        : CRASH_VARIANTS,
    [crashReleaseQuery.data, crashByRelease.variants],
  );

  const healthTiles = useMemo(
    () => (crashDiagnosticsQuery.data ? crashDiagnostics.health : HEALTH_TILES),
    [crashDiagnosticsQuery.data, crashDiagnostics.health],
  );

  const failureRows = useMemo(
    () =>
      crashHandledFailuresQuery.data
        ? crashHandledFailures.rows
        : FAILURES_BY_MODULE,
    [crashHandledFailuresQuery.data, crashHandledFailures.rows],
  );

  const filteredCrashIssues = crashIssues.filter(
    (r) =>
      (r.issue || "").toLowerCase().includes(crashSearch.toLowerCase()) ||
      (r.sub || "").toLowerCase().includes(crashSearch.toLowerCase()),
  );

  return (
    <div className="pcd-page">
      <header className="pcd-topbar">
        <div className="pcd-brand">
          <img src={LOGO_URL} alt="Panchshil" />
          <div>
            <strong>Panchshil Connect</strong>
            <span>Usage Dashboard</span>
          </div>
        </div>
        <div className="pcd-controls">
          <span className="pcd-alltime">Live analytics data</span>
        </div>
      </header>

      <div className="pud-shell">
        <aside className="pud-sidebar">
          <Link to="/panchshil_connect_dashboard" className="pud-sidebar-back">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.5 4.5 6.5 10l6 5.5" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="pud-sidebar-label">Layers</div>
          <nav className="pud-nav" aria-label="Analytics layers">
            {LAYERS.map((l) => (
              <button
                key={l.key}
                type="button"
                className={`pud-nav-item ${layer === l.key ? "is-on" : ""}`}
                onClick={() => setLayer(l.key)}
              >
                <span className="pud-nav-ic">{l.icon}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="pud-main">
          <div className="pud-page-head">
            <h2>{current.label}</h2>
            <p>{current.sub}</p>
          </div>

          {/* ==================== TRAFFIC & SESSION ==================== */}
          {layer === "traffic" ? (
            <>
              <div className="pud-qbox">
                <b>Key questions</b>
                <ul>
                  <li>
                    How many residents are actively using the application, and
                    how frequently?
                  </li>
                  <li>
                    Which projects generate the highest traffic, and are
                    residents returning?
                  </li>
                </ul>
              </div>

              <SampleNote>
                Traffic and session figures are loaded from the live analytics
                API.
              </SampleNote>

              <div className="pcd-tiles" style={{ marginTop: 16 }}>
                {trafficTiles.map((t) => (
                  <StatTile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                  />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-2">
                  <ChartCard title="Active Users Trend" subtitle="Last 24 days">
                    <AreaChart points={trafficTrend} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Device Platform Split"
                    subtitle="Share of active users, Android vs iOS"
                  >
                    <DonutChart rows={deviceSplit} centerLabel="Active Users" />
                  </ChartCard>
                </div>
              </div>
            </>
          ) : null}

          {/* ==================== ADOPTION & ENGAGEMENT ==================== */}
          {layer === "adoption" ? (
            <>
              <div className="pud-qbox">
                <b>Key questions</b>
                <ul>
                  <li>
                    Which modules and services receive the highest engagement
                    and adoption?
                  </li>
                  <li>
                    Which modules need UX improvements, and where do residents
                    spend the most time?
                  </li>
                  <li>
                    Are residents returning to the application, and is retention
                    improving over time?
                  </li>
                </ul>
              </div>

              <SampleNote>
                Adoption and engagement figures are loaded from the live
                analytics API.
              </SampleNote>

              <div className="pcd-tiles" style={{ marginTop: 16 }}>
                {adoptionTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                  />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard
                    title="Adoption Trend"
                    subtitle="Weekly active users, last 8 weeks"
                  >
                    <AreaChart
                      points={
                        adoptionTrendQuery.data
                          ? adoptionTrend.current
                          : ADOPTION_TREND
                      }
                    />
                  </ChartCard>
                </div>

                <div className="pcd-span-2">
                  <ChartCard
                    title="New · Returning · Resurrecting · Dormant"
                    subtitle="Share of the active base this week"
                  >
                    <StackedShareBar
                      rows={growthQuery.data ? growth.share : GROWTH_ACCOUNTING}
                    />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Retention · Weekly Cohorts"
                    subtitle="% of each cohort still active N weeks later"
                  >
                    <div className="pcd-table-scroll">
                      <table className="pud-cohort">
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left" }}>Cohort</th>
                            {[0, 1, 2, 3, 4, 5].map((w) => (
                              <th key={w}>Week {w}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {retentionRows.map((row) => (
                            <tr key={row.date}>
                              <td className="pud-cohort-label">{row.date}</td>
                              {row.cells.map((v, i) =>
                                v == null ? (
                                  <td key={i} className="pud-cohort-empty">
                                    ·
                                  </td>
                                ) : (
                                  <td
                                    key={i}
                                    style={{
                                      background: cohortColor(v),
                                      color: v >= 55 ? "#fff" : "#1f2933",
                                    }}
                                  >
                                    {v}%
                                  </td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-2">
                  <ChartCard
                    title="Adoption by Audience"
                    subtitle="Active users ÷ invited users"
                  >
                    <PercentHBar
                      rows={
                        rolesQuery.data
                          ? roles.roles.map((role) => ({
                              label: role.label,
                              value: role.activeShare || 0,
                            }))
                          : ROLE_SPLIT
                      }
                    />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <MetricCard
                    label="Dormant Users"
                    value={adoptionQuery.data ? adoption.dormant.value : 312}
                    caption={
                      adoptionQuery.data
                        ? `No activity ${adoption.dormant.band}`
                        : `No activity 14+ days, vs. estimated ${REGISTERED_RESIDENTS.toLocaleString()} registered residents`
                    }
                  />
                </div>

                <div className="pcd-span-4">
                  <ChartCard
                    title={
                      moduleQuery.data
                        ? "Module Activity"
                        : "Site-Wise Breakdown"
                    }
                    subtitle={
                      moduleQuery.data
                        ? "Users, events and sessions from the live analytics API"
                        : "Active users, sessions and bounce rate per live project"
                    }
                  >
                    <div className="pcd-table-scroll">
                      <table className="pcd-table">
                        <thead>
                          {moduleQuery.data ? (
                            <tr>
                              <th>Module</th>
                              <th>Users</th>
                              <th>Events</th>
                              <th>Sessions</th>
                            </tr>
                          ) : (
                            <tr>
                              <th>Project</th>
                              <th>Active users</th>
                              <th>Sessions</th>
                              <th>Avg session</th>
                              <th>Bounce</th>
                              <th>Trend</th>
                              <th>Status</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {moduleQuery.data
                            ? moduleRows.map((row) => (
                                <tr key={row.name}>
                                  <td>{row.name}</td>
                                  <td>{row.users}</td>
                                  <td>{row.events}</td>
                                  <td>{row.sessions}</td>
                                </tr>
                              ))
                            : moduleRows.map((row) => (
                                <tr key={row.project}>
                                  <td>{row.project}</td>
                                  <td>{row.active}</td>
                                  <td>{row.sessions}</td>
                                  <td>{row.avgSession}</td>
                                  <td>{row.bounce}%</td>
                                  <td>{trendArrow[row.trend]}</td>
                                  <td>
                                    <span
                                      className={`pcd-cell-pill ${
                                        statusClass[row.status]
                                      }`}
                                    >
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>
              </div>
            </>
          ) : null}

          {/* ==================== WORKFLOW USAGE ==================== */}
          {layer === "workflow" ? (
            <>
              <SampleNote>
                Workflow figures are loaded from the live analytics API.
              </SampleNote>

              <div className="pud-modnav">
                <div className="pud-modnav-buckets">
                  {WF_BUCKETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={wfBucket === b ? "is-on" : ""}
                      onClick={() =>
                        setWfKey(WORKFLOWS.find((w) => w.bucket === b).key)
                      }
                    >
                      {b}
                      <span className="pud-mcount">
                        {WORKFLOWS.filter((w) => w.bucket === b).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pud-modnav-mods">
                  {wfMods.map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      className={wfKey === w.key ? "is-on" : ""}
                      onClick={() => setWfKey(w.key)}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pcd-tiles">
                <Tile
                  label="Workflow Adoption"
                  value={`${
                    workflowQuery.data
                      ? liveWorkflow.kpis.fAdopt.value
                      : wf.adoption
                  }%`}
                  sub="of active users attempt this workflow"
                />
                <Tile
                  label="Completion Rate"
                  value={`${
                    workflowQuery.data
                      ? liveWorkflow.kpis.fComp.value
                      : wf.completionRate
                  }%`}
                  sub="of those who start it, finish it"
                />
                <Tile
                  label="Biggest Step Drop"
                  value={`${
                    workflowQuery.data
                      ? liveWorkflow.kpis.fStep.value
                      : Math.max(...funnelSteps.slice(1).map((s) => s.drop))
                  }%`}
                  sub={`at ${
                    funnelSteps
                      .slice(1)
                      .sort(
                        (a, b) =>
                          (b.drop_pct ?? b.drop ?? 0) -
                          (a.drop_pct ?? a.drop ?? 0),
                      )[0]?.step
                  }`}
                />
                <Tile
                  label="Usage Volume"
                  value={String(
                    workflowQuery.data
                      ? liveWorkflow.kpis.fVol.value
                      : wf.completions,
                  )}
                  sub="completions this period"
                />
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard
                    title={`${wf.name} — Completion Funnel`}
                    subtitle="Real event sequence, illustrative retained %"
                  >
                    <div className="pud-funnel">
                      {funnelSteps.map((row, i) => (
                        <div key={row.step}>
                          {i > 0 ? (
                            <div className="pud-funnel-drop">
                              ▼ {row.drop_pct ?? row.drop ?? 0}% drop-off
                            </div>
                          ) : null}
                          <div
                            className="pud-funnel-step"
                            style={{
                              width: `${
                                45 +
                                ((row.reach ?? row.retained ?? 0) /
                                  (funnelSteps[0]?.reach || 100)) *
                                  55
                              }%`,
                              opacity: 1 - i * 0.08,
                            }}
                            title={`${row.step}: ${
                              row.reach ?? row.retained ?? 0
                            } of entrants`}
                          >
                            {row.step}
                            <span className="pud-funnel-sub">
                              {row.reach ?? row.retained ?? 0} of entrants
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-4">
                  <ChartCard
                    title="All Screens in This Module"
                    subtitle="Users, events, sessions and completion per screen"
                  >
                    <div className="pcd-table-scroll">
                      <table className="pcd-table">
                        <thead>
                          <tr>
                            <th>Screen</th>
                            <th>Users</th>
                            <th>Events</th>
                            <th>Sessions</th>
                            <th>Completion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {screenRows.map((r) => (
                            <tr key={r.screen}>
                              <td>{r.screen}</td>
                              <td>{r.users}</td>
                              <td>{r.events}</td>
                              <td>{r.sessions}</td>
                              <td>{r.completion}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-4">
                  <ChartCard
                    title="Top Entry Screens"
                    subtitle="First screen seen in a session, org-wide (not module-filtered)"
                  >
                    <div className="pcd-table-scroll">
                      <table className="pcd-table">
                        <thead>
                          <tr>
                            <th>Screen</th>
                            <th>Visitors</th>
                            <th>Views</th>
                            <th>Bounce</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entryScreens.map((r) => (
                            <tr key={r.screen}>
                              <td>{r.screen}</td>
                              <td>{r.visitors}</td>
                              <td>{r.views}</td>
                              <td>{r.bounce}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>
              </div>
            </>
          ) : null}

          {/* ==================== APP STABILITY ==================== */}
          {layer === "stability" ? (
            <>
              <div className="pud-qbox">
                <b>Key questions</b>
                <ul>
                  <li>
                    Is the app stable for residents on the latest release, and
                    is stability trending up or down?
                  </li>
                  <li>
                    Which crashes hit the most residents, and which release or
                    device is most affected?
                  </li>
                </ul>
              </div>

              <SampleNote>
                App stability figures are loaded from the live analytics API.
              </SampleNote>

              <div className="pcd-tiles" style={{ marginTop: 16 }}>
                {stabilityTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                  />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Crash-Free Users (7-day)"
                    subtitle="% of users with no crash, day over day"
                  >
                    <AreaChart points={crashUsersTrend} color={VIZ.brand3} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Crash-Free Sessions (7-day)"
                    subtitle="% of sessions without a crash, day over day"
                  >
                    <AreaChart points={crashSessionsTrend} />
                  </ChartCard>
                </div>

                <div className="pcd-span-4">
                  <ChartCard
                    title="Top Crash Issues"
                    subtitle="Ranked by events over the last 90 days — search by title or file"
                  >
                    <input
                      type="text"
                      className="pud-search"
                      placeholder="Search issue title or file..."
                      value={crashSearch}
                      onChange={(e) => setCrashSearch(e.target.value)}
                    />
                    <div className="pcd-table-scroll">
                      <table className="pcd-table">
                        <thead>
                          <tr>
                            <th>Issue</th>
                            <th>Version</th>
                            <th>Events</th>
                            <th>Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCrashIssues.length === 0 ? (
                            <tr>
                              <td colSpan={4}>
                                No issues match "{crashSearch}".
                              </td>
                            </tr>
                          ) : (
                            filteredCrashIssues.map((r) => (
                              <tr key={r.issue}>
                                <td style={{ whiteSpace: "normal" }}>
                                  {r.issue}
                                  {r.tag ? (
                                    <span className="pud-crash-tag">
                                      {r.tag}
                                    </span>
                                  ) : null}
                                  <span className="pud-crash-sub">{r.sub}</span>
                                </td>
                                <td>
                                  <span className="pud-crash-badge">
                                    {r.version}
                                  </span>
                                </td>
                                <td>{r.events}</td>
                                <td>{r.users}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-2">
                  <ChartCard
                    title="Crashes by Release"
                    subtitle="Total crash events by app version, last 90 days"
                  >
                    <HBar rows={crashReleaseRows} color={VIZ.brand2} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Crash-Free Users by App Variant"
                    subtitle="By registered app variant / OS"
                  >
                    <PercentHBar rows={crashVariantRows} color={VIZ.brand3} />
                  </ChartCard>
                </div>
              </div>

              <SectionHead title="The non-fatal / handled-failure layer" />
              <div className="pcd-tiles">
                {healthTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                  />
                ))}
              </div>
              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard
                    title="Handled Failures by Module"
                    subtitle="Failures caught in a try/catch and recorded as a non-fatal, by module — illustrative counts, real event names"
                  >
                    <HBar rows={failureRows} color="#c98a12" />
                  </ChartCard>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default PanchshilConnectUsageDashboard;
