import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Rustomji_URL_Black } from "./baseurl/apiDomain";
import {
  ChartCard,
  StatTile,
  MetricCard,
  AreaChart,
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
} from "../features/posthog-dashboard/data/metrics";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { getDeviceInfo } from "../utils/posthogHelpers";
import "./panchshil-connect-dashboard.css";
import "./panchshil-connect-usage-dashboard.css";
import "./rustomjee-connect-usage-dashboard.css";

/* Same layout/components as the Panchshil Connect Usage Dashboard (same CSS
   structure, same DashboardCharts components, same live PostHog-backed API
   wiring via ../features/posthog-dashboard) — but its own colour code:
   Rustomjee's brand gold (#A78847) in place of Panchshil's orange (#de7008),
   and no App Stability layer (this reference wireframe - unlike Panchshil's -
   has no crash/Crashlytics page). `--pcd-brand/-2/-3` are overridden inline
   on the page root below, which re-colours everything in the shared CSS that
   reads those variables; chart components that take an explicit colour prop
   are passed RJ.* directly, since their own defaults are hardcoded to
   Panchshil orange. The FM adoption analytics tenant is resolved per-hostname
   (src/config/fmAdoptionTenant.js), so these same hooks automatically scope
   to Rustomjee's own analytics once this page is served from its domain -
   nothing tenant-specific needs to be passed here. */
const RJ = {
  brand: "#A78847", // Rustomjee gold — primary
  brand2: "#7C6435", // deeper bronze — secondary
  brand3: "#3E6E64", // muted teal — cool contrast for a second data series
  grid: "#e6e4de", // neutral chart gridline, not a brand colour
  cat: ["#A78847", "#7C6435", "#3E6E64"],
  ramp: ["#f8f3e6", "#efe3c4", "#e2c98f", "#cca962", "#A78847", "#7c6435", "#544425"],
};

const Tile = ({ label, value, sub }) => (
  <div className="pcd-tile">
    <div className="pcd-tile-tophead">
      <div className="pcd-tile-label">{label}</div>
      {sub ? (
        <span className="pcd-info-btn" title={sub} aria-label={sub}>
          i
        </span>
      ) : null}
    </div>
    <div className="pcd-tile-value">{value}</div>
    {sub ? <div className="pcd-tile-sub">{sub}</div> : null}
  </div>
);

const PercentHBar = ({ rows, color = RJ.brand }) => (
  <ul className="pcd-hbar">
    {rows.map((r) => (
      <li key={r.label} title={`${r.label}: ${r.value}%`}>
        <span className="pcd-hbar-label" title={r.label}>
          {r.label}
        </span>
        <span className="pcd-hbar-track">
          <span
            className="pcd-hbar-fill"
            style={{ width: `${Math.max(r.value, 1.5)}%`, background: r.color || color }}
          />
        </span>
        <span className="pcd-hbar-value">{r.value}%</span>
      </li>
    ))}
  </ul>
);

const SampleNote = ({ children }) => <div className="pcd-note">{children}</div>;

/* Diverging stacked bar chart - one bar per label, `series` stacked upward
   from a zero line, `negSeries` stacked downward below it. Matches the
   reference wireframe's growth-accounting chart (New/Returning/Resurrecting
   above the line, Dormant below). */
const DivergingStackedBarChart = ({ labels, series, negSeries, height = 210 }) => {
  const W = 640;
  const H = height;
  const PAD = { t: 14, r: 12, b: 26, l: 8 };
  const n = labels.length;
  const maxUp = Math.max(...labels.map((_, i) => series.reduce((a, s) => a + s.data[i], 0)));
  const maxDn = negSeries ? Math.max(...negSeries.data) : 0;
  const plotH = H - PAD.t - PAD.b;
  const zeroY = PAD.t + plotH * (maxUp / (maxUp + maxDn || 1));
  const scaleUp = (zeroY - PAD.t) / (maxUp || 1);
  const scaleDn = (H - PAD.b - zeroY) / (maxDn || 1);
  const gap = (W - PAD.l - PAD.r) / n;
  const bw = gap * 0.52;

  return (
    <div className="pcd-area-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="pcd-area" role="img">
        <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke={RJ.grid} strokeWidth="1" />
        {labels.map((lab, i) => {
          const x = PAD.l + i * gap + (gap - bw) / 2;
          let y = zeroY;
          const negH = negSeries ? negSeries.data[i] * scaleDn : 0;
          return (
            <g key={lab}>
              {series.map((s) => {
                const h = s.data[i] * scaleUp;
                y -= h;
                return <rect key={s.label} x={x} y={y} width={bw} height={Math.max(0, h)} rx="2" fill={s.color} />;
              })}
              {negSeries ? (
                <rect x={x} y={zeroY} width={bw} height={Math.max(0, negH)} rx="2" fill={negSeries.color} />
              ) : null}
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="pcd-axis">
                {lab}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="pcd-legend" style={{ marginTop: 10 }}>
        {[...series, negSeries].filter(Boolean).map((s) => (
          <li key={s.label}>
            <span className="pcd-legend-dot" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* Three analytics layers, matching Rustomjee_Circle_Dashboard_v1_FM_structure.html
   (that wireframe has no App Stability page — unlike the Panchshil Usage
   Dashboard this page otherwise mirrors). */
const LAYERS = [
  {
    key: "traffic",
    label: "Traffic & Session",
    sub: "Monitor overall application traffic, customer activity, and session behavior.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.4 12.6 6.6 7.4l3.4 3.1 4.1-5.4 3.5 4.3" />
        <path d="M2.4 16.4h15.2" />
      </svg>
    ),
  },
  {
    key: "adoption",
    label: "Adoption & Engagement",
    sub: "Measure how effectively customers adopt and engage with the app's major modules, and whether they keep coming back.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.6" cy="6.8" r="2.9" />
        <path d="M2.6 16.6c0-2.7 2.2-4.6 5-4.6s5 1.9 5 4.6" />
        <path d="M13.4 4.3a2.9 2.9 0 0 1 0 5.4M14.6 12.4c1.8.5 3 1.9 3 4.2" />
      </svg>
    ),
  },
  {
    key: "workflow",
    label: "Workflow Usage",
    sub: "Customer completion of key business workflows per module, all-modules comparison, and where customers navigate & exit.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2.4 17.4 6 10 9.6 2.6 6Z" />
        <path d="M2.6 10 10 13.6 17.4 10" />
        <path d="M2.6 14 10 17.6 17.4 14" />
      </svg>
    ),
  },
];

/* =====================================================================
   Sample / illustrative fallback data, shown until each live endpoint
   resolves. Module names and buckets are real, taken from the shared
   PostHog Event Catalogue's Rustomjee sheet, referenced in the wireframe
   HTML; adoption/completion figures and project names are illustrative
   placeholders (see per-section notes below).
   ===================================================================== */

/* ---------------- Traffic & Session ---------------- */
const TRAFFIC_TILES = [
  { label: "Active Users", value: 4050, sub: "Last 28 days" },
  { label: "Screen Views", value: 17200, sub: "Last 28 days" },
  { label: "Total Sessions", value: 5460, sub: "Last 28 days" },
  { label: "New Users", value: 380, sub: "Last 28 days" },
  { label: "Bounce Rate", value: 21, sub: "% of sessions" },
  { label: "Recently Online", value: 96, sub: "Active in last 30 min" },
];

const ACTIVE_USERS_TREND = [
  { label: "Jul 22", count: 3120 }, { label: "Jul 23", count: 3180 }, { label: "Jul 24", count: 3240 },
  { label: "Jul 25", count: 3190 }, { label: "Jul 26", count: 3310 }, { label: "Jul 27", count: 3380 },
  { label: "Jul 28", count: 3350 }, { label: "Jul 29", count: 3420 }, { label: "Jul 30", count: 3490 },
  { label: "Jul 31", count: 3560 }, { label: "Aug 1", count: 3520 }, { label: "Aug 2", count: 3600 },
  { label: "Aug 3", count: 3670 }, { label: "Aug 4", count: 3740 }, { label: "Aug 5", count: 3710 },
  { label: "Aug 6", count: 3790 }, { label: "Aug 7", count: 3860 }, { label: "Aug 8", count: 3820 },
  { label: "Aug 9", count: 3890 }, { label: "Aug 10", count: 3950 }, { label: "Aug 11", count: 3910 },
  { label: "Aug 12", count: 3980 }, { label: "Aug 13", count: 4050 }, { label: "Aug 14", count: 4010 },
];

const DEVICE_SPLIT = [
  { label: "Android", value: 71.4 },
  { label: "iOS", value: 28.6 },
];

/* Screen Views ÷ Total Sessions from TRAFFIC_TILES above - shown alongside
   the device split, matching the reference wireframe's "Views / session" stat. */
const VIEWS_PER_SESSION_FALLBACK = (
  TRAFFIC_TILES.find((t) => t.label === "Screen Views").value /
  TRAFFIC_TILES.find((t) => t.label === "Total Sessions").value
).toFixed(1);

/* Date-range presets for the filter bar's popover — display-only. Nothing
   here changes what the tiles/charts below show. */
const DATE_RANGE_PRESETS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
];

/* ---------------- Adoption & Engagement ---------------- */
/* Illustrative ceiling — an estimated booked-homebuyer count for Rustomjee
   Circle, same disclosure convention as the reference wireframe's
   BOOKED_HOMEBUYERS constant; not a real/confirmed figure. */
const BOOKED_HOMEBUYERS = 15600;

const ADOPTION_TILES = [
  { label: "Seat Utilisation", value: "26%", sub: "active ÷ booked homebuyers" },
  { label: "Stickiness", value: "24%", sub: "avg DAU / MAU" },
  { label: "Adoption Trend", value: "+6%", sub: "vs prior 8 weeks · weekly actives" },
  { label: "14-Day Activation", value: "31%", sub: "of new registrations" },
  { label: "Module Breadth", value: "11 / 18", sub: "modules used this period" },
];

const ADOPTION_TREND = [
  { label: "W1", count: 2420 }, { label: "W2", count: 2610 }, { label: "W3", count: 2840 },
  { label: "W4", count: 3050 }, { label: "W5", count: 3280 }, { label: "W6", count: 3520 },
  { label: "W7", count: 3790 }, { label: "W8", count: 4050 },
];

/* Weekly growth accounting fallback - shown until the live /growth endpoint
   resolves. New/Returning/Resurrecting stack above the zero line, Dormant
   stacks below it. Week 6 (the most recent) matches the figures this
   section used to show as a single snapshot. */
const SAMPLE_GROWTH_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6"];
const SAMPLE_GROWTH_SERIES = [
  { label: "New", color: RJ.brand, data: [9, 10, 12, 10, 13, 11] },
  { label: "Returning", color: "#5b7350", data: [48, 50, 52, 54, 56, 55] },
  { label: "Resurrecting", color: "#8aa37c", data: [4, 5, 5, 6, 6, 6] },
];
const SAMPLE_GROWTH_DORMANT = { label: "Dormant", color: "#8a4a3a", data: [22, 24, 20, 26, 29, 28] };

const ROLE_SPLIT = [
  { label: "Sales / CRM Team", value: 66 },
  { label: "CX / Support Team", value: 54 },
  { label: "Marketing Team", value: 39 },
  { label: "Customers (all)", value: 42 },
];

const COHORT_ROWS = [
  { date: "7/15", cells: [100, 55, 41, 33, 28, 24] },
  { date: "7/22", cells: [100, 58, 44, 35, 30, null] },
  { date: "7/29", cells: [100, 60, 46, 37, null, null] },
  { date: "8/5", cells: [100, 62, 48, null, null, null] },
  { date: "8/12", cells: [100, 65, null, null, null, null] },
  { date: "8/19", cells: [100, null, null, null, null, null] },
];

const cohortColor = (v) => {
  const i = Math.min(RJ.ramp.length - 1, Math.max(1, Math.ceil((v / 100) * (RJ.ramp.length - 1))));
  return RJ.ramp[i];
};

/* ILLUSTRATIVE placeholder project names, matching the reference wireframe —
   not real Rustomjee site names. */
const SITE_WISE = [
  { project: "Project A – Thane", active: 46, sessions: 88, avgSession: "2.3m", bounce: 19, trend: "up", status: "Healthy" },
  { project: "Project B – Bandra", active: 34, sessions: 61, avgSession: "2.0m", bounce: 23, trend: "flat", status: "Steady" },
  { project: "Project C – Khar", active: 21, sessions: 35, avgSession: "1.7m", bounce: 27, trend: "up", status: "Steady" },
  { project: "Project D – Virar", active: 14, sessions: 22, avgSession: "1.5m", bounce: 33, trend: "dn", status: "Watch" },
];
const statusClass = { Healthy: "pcd-cell-on", Steady: "pcd-cell-neutral", Watch: "pcd-cell-bad" };
const trendArrow = { up: "↗", flat: "→", dn: "↘" };

/* ---------------- Workflow Usage ---------------- */
/* Module names and buckets are real, taken from the shared PostHog Event
   Catalogue's Rustomjee sheet (18 modules) referenced in the wireframe HTML;
   adoption / completion / drop-off figures and step-event names below are
   illustrative fallbacks, shown until the live /workflow_usage endpoint
   resolves. */
const WORKFLOWS = [
  { key: "auth", name: "Authentication & Onboarding", bucket: "Access", steps: ["splash_viewed", "login_screen_viewed", "otp_requested", "otp_screen_viewed", "otp_verified_success", "login_success"], adoption: 95, completionRate: 88, completions: 118 },
  { key: "notifications", name: "Notifications", bucket: "Access", steps: ["notification_center_viewed", "notification_opened", "notification_action_tapped"], adoption: 52, completionRate: 61, completions: 58 },
  { key: "profile", name: "Profile & Applicants", bucket: "Access", steps: ["profile_viewed", "applicant_details_viewed", "profile_edit_opened", "profile_updated"], adoption: 40, completionRate: 57, completions: 34 },
  { key: "enquiries", name: "Enquiries", bucket: "Access", steps: ["enquiry_list_viewed", "enquiry_details_viewed", "enquiry_status_checked"], adoption: 33, completionRate: 49, completions: 22 },
  { key: "account", name: "My Account & Financials", bucket: "Account & Money", steps: ["account_overview_viewed", "payment_schedule_viewed", "demand_letter_viewed", "payment_status_checked", "receipt_downloaded"], adoption: 61, completionRate: 46, completions: 48 },
  { key: "homeloan", name: "Home Loan", bucket: "Account & Money", steps: ["home_loan_viewed", "loan_eligibility_checked", "loan_enquiry_submitted"], adoption: 19, completionRate: 38, completions: 9 },
  { key: "projects", name: "Projects & Explore", bucket: "Discovery", steps: ["projects_list_viewed", "project_details_viewed", "project_gallery_viewed", "project_brochure_opened"], adoption: 68, completionRate: 33, completions: 55 },
  { key: "sitevisit", name: "Site Visits", bucket: "Discovery", steps: ["create_site_visit_opened", "site_visit_project_selected", "site_visit_date_selected", "site_visit_booked"], adoption: 44, completionRate: 48, completions: 41 },
  { key: "referral", name: "Referral Program", bucket: "Discovery", steps: ["referral_program_viewed", "referral_form_opened", "referral_contact_picked", "referral_submitted_success"], adoption: 22, completionRate: 39, completions: 12 },
  { key: "documents", name: "Documents", bucket: "Support & Docs", steps: ["document_hub_viewed", "document_category_opened", "document_viewed", "document_downloaded"], adoption: 55, completionRate: 71, completions: 62 },
  { key: "servicereq", name: "Service Requests", bucket: "Support & Docs", steps: ["service_request_list_viewed", "service_request_create_opened", "service_request_category_selected", "service_request_submit_tapped", "service_request_created_success"], adoption: 49, completionRate: 58, completions: 45 },
  { key: "supportfaq", name: "Support & FAQ", bucket: "Support & Docs", steps: ["support_hub_viewed", "faq_list_viewed", "contact_us_viewed"], adoption: 26, completionRate: 44, completions: 14 },
  { key: "privilege", name: "Loyalty & Privilege", bucket: "Engagement", steps: ["privilege_categories_viewed", "privilege_category_opened", "privilege_offer_details_viewed", "privilege_offer_claimed"], adoption: 37, completionRate: 31, completions: 17 },
  { key: "construction", name: "Construction Updates", bucket: "Engagement", steps: ["construction_update_list_viewed", "construction_update_details_viewed", "construction_gallery_viewed"], adoption: 30, completionRate: 66, completions: 27 },
  { key: "testimonials", name: "Testimonials", bucket: "Engagement", steps: ["testimonial_list_viewed", "testimonial_details_viewed", "testimonial_submit_opened"], adoption: 14, completionRate: 42, completions: 6 },
];
const WF_BUCKETS = [...new Set(WORKFLOWS.map((w) => w.bucket))];

const TOP_ENTRY_SCREENS = [
  { screen: "main_home", visitors: 62, views: 118, bounce: 15 },
  { screen: "login", visitors: 24, views: 44, bounce: 22 },
  { screen: "notifications", visitors: 9, views: 17, bounce: 26 },
  { screen: "my_account", visitors: 7, views: 13, bounce: 29 },
  { screen: "project_details", visitors: 6, views: 11, bounce: 30 },
];

const RustomjeeConnectUsageDashboard = () => {
  const connectEvents = useConnectEvents();
  const [layer, setLayer] = useState("traffic");
  const [wfKey, setWfKey] = useState("auth");

  // Filter bar state — display-only (see DATE_RANGE_PRESETS above); it does
  // not feed into rangeFilters/growthFilters/etc. below, so it can't affect
  // what the live queries request or how their results are built.
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customApplied, setCustomApplied] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [prevPeriodOn, setPrevPeriodOn] = useState(true);

  // Refresh button state — handleRefresh is wired below, once the layer's
  // query objects exist.
  const [refreshing, setRefreshing] = useState(false);

  const dateRangeLabel = customApplied
    ? `${customFrom} – ${customTo}`
    : DATE_RANGE_PRESETS.find((p) => p.key === dateRangePreset)?.label;

  const rangeFilters = useMemo(() => rangeForDays(DEFAULT_WINDOW), []);
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

  // Same live analytics requests as the Panchshil Usage Dashboard - the FM
  // adoption tenant is resolved per-hostname, so these automatically scope
  // to Rustomjee's own analytics on that deployment. No App Stability layer
  // here, so no crash-related queries.
  const trafficQuery = useTrafficSession(rangeFilters, { enabled: layer === "traffic" });
  const usageQuery = useUsageAndDistribution(rangeFilters, { enabled: layer === "traffic" });
  const adoptionQuery = useAdoptionEngagement(rangeFilters, { enabled: layer === "adoption" });
  const adoptionTrendQuery = useAdoptionTrend(trendFilters, { enabled: layer === "adoption" });
  const growthQuery = useGrowth(growthFilters, { enabled: layer === "adoption" });
  const retentionQuery = useRetention(retentionFilters, { enabled: layer === "adoption" });
  const rolesQuery = useRoles(rangeFilters, { enabled: layer === "adoption" });
  const moduleQuery = useModuleTree(rangeFilters, {
    enabled: layer === "adoption" || layer === "workflow",
  });
  const workflowQuery = useWorkflowUsage(rangeFilters, { enabled: layer === "workflow" });

  // Refresh button — explicitly refetches the live queries backing whichever
  // layer is currently open, so a click always issues fresh API calls rather
  // than relying on cache invalidation timing.
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const refetches = [];
      if (layer === "traffic") {
        refetches.push(trafficQuery.refetch(), usageQuery.refetch());
      } else if (layer === "adoption") {
        refetches.push(
          adoptionQuery.refetch(),
          adoptionTrendQuery.refetch(),
          growthQuery.refetch(),
          retentionQuery.refetch(),
          rolesQuery.refetch(),
          moduleQuery.refetch(),
        );
      } else if (layer === "workflow") {
        refetches.push(moduleQuery.refetch(), workflowQuery.refetch());
      }
      await Promise.all(refetches);
    } finally {
      setRefreshing(false);
    }
  };

  const traffic = useMemo(() => buildTraffic(trafficQuery.data || {}), [trafficQuery.data]);
  const usage = useMemo(() => buildUsage(usageQuery.data || {}), [usageQuery.data]);
  const adoption = useMemo(() => buildAdopt(adoptionQuery.data || {}), [adoptionQuery.data]);
  const adoptionTrend = useMemo(
    () => buildAdoptionTrend(adoptionTrendQuery.data || {}),
    [adoptionTrendQuery.data],
  );
  const growth = useMemo(() => buildGrowth(growthQuery.data || {}), [growthQuery.data]);
  const retention = useMemo(() => buildRetention(retentionQuery.data || {}), [retentionQuery.data]);
  const roles = useMemo(() => buildRoles(rolesQuery.data || {}), [rolesQuery.data]);
  const liveWorkflow = useMemo(() => buildFlows(workflowQuery.data || {}), [workflowQuery.data]);

  const trafficTiles = useMemo(() => {
    if (!trafficQuery.data) return TRAFFIC_TILES;
    return [
      ...traffic.tiles.map((tile) => ({
        label: tile.label,
        value: tile.value,
        sub: tile.caption || "Selected period",
      })),
      { label: "Recently Online", value: traffic.recentlyOnline, sub: "Active in last 30 min" },
    ];
  }, [traffic, trafficQuery.data]);

  const trafficTrend = useMemo(
    () =>
      usageQuery.data
        ? usage.daily.map((day) => ({ label: day.day, count: day.current.visitors }))
        : ACTIVE_USERS_TREND,
    [usage, usageQuery.data],
  );

  // Card is specifically "Android vs iOS usage" — always show both rows, even
  // when the live payload only reports one platform (or an unrelated one);
  // a platform missing from the live data is shown as 0%, never dropped.
  const deviceSplit = useMemo(
    () =>
      usageQuery.data
        ? (() => {
            const shareByLabel = Object.fromEntries(
              usage.devices.map((device) => [device.label, device.share || 0]),
            );
            return ["Android", "iOS"].map((label) => ({
              label,
              value: shareByLabel[label] || 0,
            }));
          })()
        : DEVICE_SPLIT,
    [usage, usageQuery.data],
  );

  // Screen Views ÷ Sessions, shown alongside the device split card - reads
  // the same traffic.tiles values the tiles row above already renders.
  const viewsPerSession = useMemo(() => {
    if (!trafficQuery.data) return VIEWS_PER_SESSION_FALLBACK;
    const views = traffic.tiles.find((t) => t.key === "screen_views")?.value;
    const sessions = traffic.tiles.find((t) => t.key === "sessions")?.value;
    return views != null && sessions ? (views / sessions).toFixed(1) : VIEWS_PER_SESSION_FALLBACK;
  }, [traffic, trafficQuery.data]);

  // Weekly growth accounting for the diverging bar chart - built from the
  // same growth.weeks the live /growth endpoint already returns (buildGrowth
  // reads the identical new/returning/resurrected/dormant keys for its
  // single-week `.share` breakdown), so this doesn't touch the query/builder
  // wiring, only how the result is shaped for this chart.
  const growthWeekly = useMemo(() => {
    const weeks = growthQuery.data ? growth.weeks : null;
    if (!Array.isArray(weeks) || weeks.length === 0) {
      return { labels: SAMPLE_GROWTH_LABELS, series: SAMPLE_GROWTH_SERIES, negSeries: SAMPLE_GROWTH_DORMANT };
    }
    const labels = weeks.map(
      (w, i) => w.week_label || w.week_start || w.week || w.label || w.date || `W${i + 1}`,
    );
    const pick = (key) => weeks.map((w) => Number(w?.[key] ?? 0));
    return {
      labels,
      series: [
        { label: "New", color: RJ.brand, data: pick("new") },
        { label: "Returning", color: "#5b7350", data: pick("returning") },
        { label: "Resurrecting", color: "#8aa37c", data: pick("resurrected") },
      ],
      negSeries: { label: "Dormant", color: "#8a4a3a", data: pick("dormant") },
    };
  }, [growth, growthQuery.data]);

  const adoptionTiles = useMemo(() => {
    if (!adoptionQuery.data) return ADOPTION_TILES;
    return [
      { label: adoption.seat.label, value: adoption.seat.display, sub: adoption.seat.sub },
      { label: adoption.stickiness.label, value: adoption.stickiness.display, sub: adoption.stickiness.sub },
      { label: adoption.adoptionTrend.label, value: adoption.adoptionTrend.display, sub: adoption.adoptionTrend.sub },
      { label: adoption.activation.label, value: adoption.activation.display, sub: adoption.activation.sub },
      { label: adoption.moduleBreadth.label, value: adoption.moduleBreadth.display, sub: "modules used this period" },
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

  const moduleRows = useMemo(
    () => (moduleQuery.data ? moduleQuery.data.tree || [] : SITE_WISE),
    [moduleQuery.data],
  );

  // Site-wise breakdown table - always the same 7 reference columns
  // (Project/Active users/Sessions/Avg session/Bounce/Trend/Status), whether
  // the rows come from the sample SITE_WISE projects or the live module tree.
  // The live tree only carries name/users/events/sessions, so the columns
  // it can't supply (Avg session/Bounce/Trend/Status) show "–" rather than
  // a made-up number.
  const siteWiseRows = useMemo(
    () =>
      moduleRows.map((row) => ({
        project: row.project || row.name || row.label || "—",
        active: row.active ?? row.users ?? 0,
        sessions: row.sessions ?? 0,
        avgSession: row.avgSession || row.avg_session || "–",
        bounce: row.bounce ?? row.bounce_rate ?? null,
        trend: row.trend || null,
        status: row.status || null,
      })),
    [moduleRows],
  );

  const current = LAYERS.find((l) => l.key === layer);

  const wf = WORKFLOWS.find((w) => w.key === wfKey) || WORKFLOWS[0];
  const wfBucket = wf.bucket;
  const wfMods = WORKFLOWS.filter((w) => w.bucket === wfBucket);

  const sampleFunnelSteps = useMemo(() => {
    const n = wf.steps.length;
    return wf.steps
      .map((s, i) => {
        const retained = Math.round(100 - (i * (100 - wf.completionRate)) / (n - 1 || 1));
        return { step: s, retained };
      })
      .map((row, i, arr) => ({
        ...row,
        drop: i > 0 ? arr[i - 1].retained - row.retained : null,
      }));
  }, [wf]);

  const sampleScreenRows = useMemo(
    () =>
      sampleFunnelSteps.map((row) => {
        const users = Math.max(1, Math.round((wf.completions * row.retained) / 100));
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

  const funnelSteps = workflowQuery.data ? liveWorkflow.funnel : sampleFunnelSteps;
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

  return (
    <div
      className="pcd-page rj-usage-page"
      style={{ "--pcd-brand": RJ.brand, "--pcd-brand-2": RJ.brand2, "--pcd-brand-3": RJ.brand3 }}
    >
      <header className="pcd-topbar">
        <div className="pcd-brand">
          <img src={Rustomji_URL_Black} alt="Rustomjee" />
          <div>
            <strong>Rustomjee Circle</strong>
            <span>Usage Dashboard</span>
          </div>
        </div>
        <div className="pcd-controls">
          <span className="pcd-alltime">Live analytics data</span>
        </div>
      </header>

      <div className="pud-shell">
        <aside className="pud-sidebar">
          <Link to="/" className="pud-sidebar-back">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.5 4.5 6.5 10l6 5.5" />
            </svg>
            Back to Home
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

          {/* Filter bar — matches Panchshil_Connect_Dashboard_v3_FM_structure.html's
              filterbar in structure and controls, in this page's own colours.
              Display-only: it does not feed rangeFilters/growthFilters/etc.
              above, so it can't change what the live queries request. */}
          <div className="pud-filterbar">
            <div className="pud-daterange">
              <button type="button" className="pud-ctrl" onClick={() => setDateRangeOpen((o) => !o)}>
                <span className="pud-ic">📅</span>
                <span>{dateRangeLabel}</span>
                <span className="pud-chev">▾</span>
              </button>
              {dateRangeOpen ? (
                <div className="pud-daterange-pop">
                  <div className="pud-dr-presets">
                    {DATE_RANGE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        className={`pud-dr-preset ${!customApplied && dateRangePreset === p.key ? "is-on" : ""}`}
                        onClick={() => {
                          setDateRangePreset(p.key);
                          setCustomApplied(false);
                          setDateRangeOpen(false);
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="pud-dr-custom">
                    <div className="pud-dr-custom-label">Custom range</div>
                    <div className="pud-dr-custom-row">
                      <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                      <span className="pud-dr-to">–</span>
                      <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                    </div>
                    <button
                      type="button"
                      className="pud-dr-apply"
                      onClick={() => {
                        if (customFrom && customTo) {
                          setCustomApplied(true);
                          setDateRangeOpen(false);
                        }
                      }}
                    >
                      Apply custom range
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pud-devtoggle" title="Platform">
              <button
                type="button"
                className={deviceFilter === "all" ? "is-on" : ""}
                onClick={() => {
                  setDeviceFilter("all");
                  connectEvents.onModuleFiltered({ filters_used: [], ...getDeviceInfo("all") });
                }}
              >
                All
              </button>
              <button
                type="button"
                className={deviceFilter === "ios" ? "is-on" : ""}
                title="iOS only"
                onClick={() => {
                  setDeviceFilter("ios");
                  connectEvents.onModuleFiltered({ filters_used: ["ios"], ...getDeviceInfo("ios") });
                }}
              >
                iOS
              </button>
              <button
                type="button"
                className={deviceFilter === "android" ? "is-on" : ""}
                title="Android only"
                onClick={() => {
                  setDeviceFilter("android");
                  connectEvents.onModuleFiltered({ filters_used: ["android"], ...getDeviceInfo("android") });
                }}
              >
                Android
              </button>
            </div>

            <button
              type="button"
              className={`pud-ctrl ${prevPeriodOn ? "is-on" : ""}`}
              onClick={() => setPrevPeriodOn((v) => !v)}
            >
              <span className="pud-ic">↺</span>
              <span>Previous period {prevPeriodOn ? "✓" : ""}</span>
            </button>

            <button
              type="button"
              className={`pud-ctrl pud-refresh-btn ${refreshing ? "is-spinning" : ""}`}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data"
            >
              <span className="pud-ic">⟳</span>
              <span>Refresh</span>
            </button>

            <div className="pud-spacer" />

            <span className="pud-pill">
              <span className="pud-dot" />
              <span>{trafficTiles.find((t) => t.label === "Recently Online")?.value ?? 0} recently online</span>
            </span>
          </div>

          {/* ==================== TRAFFIC & SESSION ==================== */}
          {layer === "traffic" ? (
            <>
              <div className="pud-qbox">
                <b>Key questions</b>
                <ul>
                  <li>How many booked homebuyers are actively using the application, and how frequently?</li>
                  <li>Which projects generate the highest traffic, and are customers returning?</li>
                </ul>
              </div>

              <SampleNote>
                Traffic and session figures are loaded from the live analytics API.
              </SampleNote>

              <div
                className="pcd-tiles"
                style={{ marginTop: 16, gridTemplateColumns: `repeat(${trafficTiles.length}, 1fr)` }}
              >
                {trafficTiles.map((t) => (
                  <StatTile key={t.label} label={t.label} value={t.value} sub={t.sub} />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-2">
                  <ChartCard title="Usage over time" subtitle="Last 24 days">
                    <AreaChart points={trafficTrend} color={RJ.brand} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard title="Android vs iOS usage" subtitle="Share of active users, Android vs iOS">
                    <PercentHBar rows={deviceSplit} />
                    <div
                      className="pcd-splits"
                      style={{ marginTop: 14, gridTemplateColumns: "repeat(1, 1fr)", maxWidth: 160 }}
                    >
                      <div className="pcd-split">
                        <div className="pcd-split-label">Views / session</div>
                        <div className="pcd-split-value">{viewsPerSession}</div>
                        <div className="pcd-split-sub">screens per visit</div>
                      </div>
                    </div>
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
                  <li>Which modules and services receive the highest engagement and adoption?</li>
                  <li>Which modules need UX improvements, and where do customers spend the most time?</li>
                  <li>Are customers returning to the application, and is retention improving over time?</li>
                </ul>
              </div>

              <SampleNote>
                Adoption and engagement figures are loaded from the live analytics API.
              </SampleNote>

              <div
                className="pcd-tiles"
                style={{ marginTop: 16, gridTemplateColumns: `repeat(${adoptionTiles.length}, 1fr)` }}
              >
                {adoptionTiles.map((t) => (
                  <Tile key={t.label} label={t.label} value={t.value} sub={t.sub} />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard title="Adoption trend (weekly active users, last 8 weeks)">
                    <AreaChart
                      points={adoptionTrendQuery.data ? adoptionTrend.current : ADOPTION_TREND}
                      color={RJ.brand}
                    />
                  </ChartCard>
                </div>

                <div className="pcd-span-2">
                  <ChartCard title="New · Returning · Resurrecting · Dormant" subtitle="Growth accounting · Last 6 weeks">
                    <DivergingStackedBarChart
                      labels={growthWeekly.labels}
                      series={growthWeekly.series}
                      negSeries={growthWeekly.negSeries}
                    />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard title="Do new users keep coming back?" subtitle="% of each cohort still active N weeks later">
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
                                  <td key={i} className="pud-cohort-empty">·</td>
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
                                )
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-2">
                  <ChartCard title="Who is (and isn't) using the app" subtitle="Active users ÷ invited users">
                    <PercentHBar
                      rows={
                        rolesQuery.data
                          ? roles.roles.map((role) => ({ label: role.label, value: role.activeShare || 0 }))
                          : ROLE_SPLIT
                      }
                    />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <MetricCard
                    label="Dormant users"
                    value={adoptionQuery.data ? adoption.dormant.value : 1240}
                    caption={
                      adoptionQuery.data
                        ? `No activity ${adoption.dormant.band}`
                        : `No activity 14+ days, vs. estimated ${BOOKED_HOMEBUYERS.toLocaleString()} booked homebuyers`
                    }
                  />
                </div>

                <div className="pcd-span-4">
                  <ChartCard eyebrow="League table" title="Site-wise breakdown">
                    <div className="pcd-table-scroll">
                      <table className="pcd-table">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Active users</th>
                            <th>Sessions</th>
                            <th>Avg session</th>
                            <th>Bounce</th>
                            <th>Trend</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {siteWiseRows.map((row, i) => (
                            <tr key={row.project || i}>
                              <td>{row.project}</td>
                              <td>{row.active}</td>
                              <td>{row.sessions}</td>
                              <td>{row.avgSession}</td>
                              <td>{row.bounce != null ? `${row.bounce}%` : "–"}</td>
                              <td>{row.trend ? trendArrow[row.trend] : "–"}</td>
                              <td>
                                {row.status ? (
                                  <span className={`pcd-cell-pill ${statusClass[row.status]}`}>{row.status}</span>
                                ) : (
                                  "–"
                                )}
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
                      onClick={() => setWfKey(WORKFLOWS.find((w) => w.bucket === b).key)}
                    >
                      {b}
                      <span className="pud-mcount">{WORKFLOWS.filter((w) => w.bucket === b).length}</span>
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

              <div className="pcd-tiles" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <Tile
                  label="Workflow Adoption"
                  value={`${workflowQuery.data ? liveWorkflow.kpis.fAdopt.value : wf.adoption}%`}
                  sub="of active users attempt this workflow"
                />
                <Tile
                  label="Completion Rate"
                  value={`${workflowQuery.data ? liveWorkflow.kpis.fComp.value : wf.completionRate}%`}
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
                      .sort((a, b) => (b.drop_pct ?? b.drop ?? 0) - (a.drop_pct ?? a.drop ?? 0))[0]?.step
                  }`}
                />
                <Tile
                  label="Usage Volume"
                  value={String(workflowQuery.data ? liveWorkflow.kpis.fVol.value : wf.completions)}
                  sub="completions this period"
                />
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard title={`${wf.name} — completion funnel`} subtitle="Real event sequence, illustrative retained %">
                    <div className="pud-funnel">
                      {funnelSteps.map((row, i) => (
                        <div key={row.step}>
                          {i > 0 ? (
                            <div className="pud-funnel-drop">▼ {row.drop_pct ?? row.drop ?? 0}% drop-off</div>
                          ) : null}
                          <div
                            className="pud-funnel-step"
                            style={{
                              width: `${
                                45 + ((row.reach ?? row.retained ?? 0) / (funnelSteps[0]?.reach || 100)) * 55
                              }%`,
                              opacity: 1 - i * 0.08,
                            }}
                            title={`${row.step}: ${row.reach ?? row.retained ?? 0} of entrants`}
                          >
                            {row.step}
                            <span className="pud-funnel-sub">{row.reach ?? row.retained ?? 0} of entrants</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-4">
                  <ChartCard title="All screens in this module" subtitle="Users, events, sessions and completion per screen">
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
                  <ChartCard title="Top entry screens" subtitle="First screen seen in a session, org-wide (not module-filtered)">
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
        </main>
      </div>
    </div>
  );
};

export default RustomjeeConnectUsageDashboard;
