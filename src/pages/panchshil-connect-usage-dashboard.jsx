import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { LOGO_URL, baseURL } from "./baseurl/apiDomain";
import {
  ChartCard,
  SectionHead,
  MetricCard,
  AreaChart,
  HBar,
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
import { InfoButton, InfoPopover } from "./usage-info-popover";
import { hasInfo } from "./usage-info-data";
import "./panchshil-connect-dashboard.css";
import "./panchshil-connect-usage-dashboard.css";

/* A tile whose value is already a formatted string (e.g. "94%", "1.0.6 (8)"),
   unlike DashboardCharts' StatTile which always runs the value through
   Intl.NumberFormat. Same markup/classes, so it looks identical. */
const Tile = ({ label, value, sub, infoKey, onInfo }) => (
  <div className="pcd-tile">
    <div className="pcd-tile-tophead">
      <div className="pcd-tile-label">{label}</div>
      {hasInfo(infoKey) ? (
        <InfoButton infoKey={infoKey} onInfo={onInfo} />
      ) : null}
    </div>
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
        <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke={VIZ.grid} strokeWidth="1" />
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
  // {
  //   key: "stability",
  //   label: "App Stability",
  //   sub: "Crash rates and the issues actually causing residents to drop out mid-session.",
  //   icon: (
  //     <svg
  //       viewBox="0 0 20 20"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="1.6"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="M10 2.6 3 16.4h14L10 2.6Z" />
  //       <path d="M10 8v3.6M10 14.2v.1" />
  //     </svg>
  //   ),
  // },
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
  { label: "Active Users", value: 108, sub: "Last 28 days", infoKey: "traffic.active_users" },
  { label: "Screen Views", value: 243, sub: "Last 28 days", infoKey: "traffic.screen_views" },
  { label: "Total Sessions", value: 176, sub: "Last 28 days", infoKey: "traffic.sessions" },
  { label: "New Users", value: 40, sub: "Last 28 days", infoKey: "traffic.new_users" },
  { label: "Bounce Rate", value: 18, sub: "% of sessions", infoKey: "traffic.bounce_rate" },
  { label: "Recently Online", value: 6, sub: "Active in last 30 min", infoKey: "traffic.recently_online" },
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

/* Views/Sessions sample trends (scaled off ACTIVE_USERS_TREND's visitors,
   using the same ratios as TRAFFIC_TILES: ~2.25x for views, ~1.6x for
   sessions), plus a "previous period" line ~9% below each - shown until the
   live /usage_and_distribution endpoint resolves, matching the reference
   wireframe's Visitors/Views/Sessions tab switcher and dashed comparison line. */
const scaleTrend = (base, factor) => base.map((p) => ({ label: p.label, count: Math.round(p.count * factor) }));
const SAMPLE_VIEWS_TREND = scaleTrend(ACTIVE_USERS_TREND, 2.25);
const SAMPLE_SESSIONS_TREND = scaleTrend(ACTIVE_USERS_TREND, 1.63);
const SAMPLE_PREV_FACTOR = 0.91;
const SAMPLE_USAGE_TRENDS = {
  visitors: { current: ACTIVE_USERS_TREND, previous: scaleTrend(ACTIVE_USERS_TREND, SAMPLE_PREV_FACTOR) },
  views: { current: SAMPLE_VIEWS_TREND, previous: scaleTrend(SAMPLE_VIEWS_TREND, SAMPLE_PREV_FACTOR) },
  sessions: { current: SAMPLE_SESSIONS_TREND, previous: scaleTrend(SAMPLE_SESSIONS_TREND, SAMPLE_PREV_FACTOR) },
};

/* Both bars use the same brand orange. */
const DEVICE_SPLIT_COLORS = { Android: VIZ.brand, iOS: VIZ.brand };
const DEVICE_SPLIT = [
  { label: "Android", value: 67.6, color: DEVICE_SPLIT_COLORS.Android },
  { label: "iOS", value: 32.4, color: DEVICE_SPLIT_COLORS.iOS },
];

/* Screen Views ÷ Total Sessions from TRAFFIC_TILES above - shown alongside
   the device split, matching the reference wireframe's "Views / session" stat. */
const VIEWS_PER_SESSION_FALLBACK = (
  TRAFFIC_TILES.find((t) => t.label === "Screen Views").value /
  TRAFFIC_TILES.find((t) => t.label === "Total Sessions").value
).toFixed(1);

/* Date-range presets for the filter bar's popover — display-only, matching
   Panchshil_Connect_Dashboard_v3_FM_structure.html's filterbar. Nothing here
   changes what the tiles/charts below show. */
const DATE_RANGE_PRESETS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
];

/* ---------------- Adoption & Engagement ---------------- */
const REGISTERED_RESIDENTS = 450; // estimated ceiling, matches the source wireframe

const ADOPTION_TILES = [
  {
    label: "Seat Utilisation",
    value: "24%",
    sub: "active ÷ registered residents",
    infoKey: "adoption.seat",
  },
  { label: "Stickiness", value: "26%", sub: "avg DAU / MAU", infoKey: "adoption.stickiness" },
  {
    label: "Adoption Trend",
    value: "+7%",
    sub: "vs prior 8 weeks · weekly actives",
    infoKey: "adoption.trend",
  },
  { label: "14-Day Activation", value: "33%", sub: "of new registrations", infoKey: "adoption.activation" },
  {
    label: "Module Breadth",
    value: "13 / 20",
    sub: "modules used this period",
    infoKey: "adoption.module_breadth",
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

/* Weekly growth accounting fallback - shown until the live /growth endpoint
   resolves. New/Returning/Resurrecting stack above the zero line, Dormant
   stacks below it, matching the reference wireframe's diverging bar chart.
   Week 6 (the most recent) matches the figures this section used to show
   as a single snapshot. */
const SAMPLE_GROWTH_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6"];
const SAMPLE_GROWTH_SERIES = [
  { label: "New", color: VIZ.brand, data: [11, 12, 15, 13, 16, 14] },
  { label: "Returning", color: "#1c6b3f", data: [46, 48, 50, 53, 55, 52] },
  { label: "Resurrecting", color: "#5fb98a", data: [3, 3, 4, 4, 5, 4] },
];
const SAMPLE_GROWTH_DORMANT = { label: "Dormant", color: VIZ.brand2, data: [10, 11, 9, 13, 14, 12] };

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
const PROJECT_FILTER_OPTIONS = ["All Projects", ...SITE_WISE.map((r) => r.project)];

/* react-select styling for the project filter — compact, borderless (sits
   inside the .pud-ctrl pill), light theme, and scrollable via react-select's
   own menuList (built-in overflow, capped by maxMenuHeight below) instead of
   relying on the native <select> popup. */
const PROJECT_SELECT_STYLES = {
  control: (base) => ({
    ...base,
    minHeight: "22px",
    border: "none",
    boxShadow: "none",
    background: "transparent",
    cursor: "pointer",
  }),
  valueContainer: (base) => ({ ...base, padding: "0 2px" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (base) => ({ ...base, height: "22px" }),
  dropdownIndicator: (base) => ({ ...base, padding: "0 2px", color: "var(--pcd-muted)" }),
  singleValue: (base) => ({ ...base, color: "var(--pcd-ink)", fontWeight: 500, fontSize: "13px" }),
  placeholder: (base) => ({ ...base, fontSize: "13px" }),
  menu: (base) => ({ ...base, zIndex: 9999, minWidth: "230px" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (base) => ({ ...base, padding: "4px" }),
  option: (base, state) => ({
    ...base,
    borderRadius: "6px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "13px",
    backgroundColor: state.isSelected ? "#fdf1e4" : state.isFocused ? "#f6f4f2" : "transparent",
    color: state.isSelected ? "var(--pcd-brand)" : "var(--pcd-ink)",
    fontWeight: state.isSelected ? 700 : 500,
  }),
};
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
  // ---------------- Access ----------------
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
    key: "theme",
    name: "Appearance (Theme)",
    bucket: "Access",
    steps: ["theme_settings_viewed", "theme_option_selected", "theme_applied"],
    adoption: 28,
    completionRate: 76,
    completions: 18,
  },
  // ---------------- Account & Money ----------------
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
  // ---------------- Discovery ----------------
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
    key: "favourites",
    name: "Favourites",
    bucket: "Discovery",
    steps: ["favourites_viewed", "project_favourited", "favourite_removed"],
    adoption: 24,
    completionRate: 58,
    completions: 11,
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
    key: "enquiry",
    name: "Enquiry",
    bucket: "Discovery",
    steps: ["enquiry_form_opened", "enquiry_details_entered", "enquiry_submitted_success"],
    adoption: 33,
    completionRate: 47,
    completions: 15,
  },
  // ---------------- Support & Docs ----------------
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
    key: "notifications",
    name: "Notifications",
    bucket: "Support & Docs",
    steps: ["notification_center_viewed", "notification_opened", "notification_action_tapped"],
    adoption: 52,
    completionRate: 61,
    completions: 31,
  },
  // ---------------- Engagement ----------------
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
  {
    key: "newspress",
    name: "News & Press",
    bucket: "Engagement",
    steps: ["news_list_viewed", "news_article_viewed", "news_article_shared"],
    adoption: 19,
    completionRate: 44,
    completions: 8,
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
    infoKey: "stability.crash_free_users",
  },
  {
    label: "Crash-Free Sessions",
    value: "98.4%",
    sub: "last 90 days, latest release",
    infoKey: "stability.crash_free_sessions",
  },
  { label: "Total Crashes", value: "12", sub: "last 90 days, all releases", infoKey: "stability.total_crashes" },
  {
    label: "Affected Users",
    value: "9",
    sub: "distinct users who hit a crash",
    infoKey: "stability.affected_users",
  },
  {
    label: "Latest Release",
    value: "1.0.6 (8)",
    sub: "com.lockated.resident_panchshil",
    infoKey: "stability.latest_release",
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
  const [usageTab, setUsageTab] = useState("visitors");

  // Filter bar state — display-only (see DATE_RANGE_PRESETS above); it does
  // not feed into rangeFilters/growthFilters/etc. below, so it can't affect
  // what the live queries request or how their results are built.
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customApplied, setCustomApplied] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [prevPeriodOn, setPrevPeriodOn] = useState(true);

  // (i) explainer popover — { key, rect } or null.
  const [infoPopover, setInfoPopover] = useState(null);
  const openInfoPopover = useCallback(
    (key, rect) => setInfoPopover((cur) => (cur?.key === key ? null : { key, rect })),
    [],
  );
  const closeInfoPopover = useCallback(() => setInfoPopover(null), []);

  const dateRangeLabel = customApplied
    ? `${customFrom} – ${customTo}`
    : DATE_RANGE_PRESETS.find((p) => p.key === dateRangePreset)?.label;

  // Project dropdown — same projects.json call used on the Banner create page,
  // so this filter lists the same live projects instead of the sample set.
  const [liveProjects, setLiveProjects] = useState([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseURL}projects.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setLiveProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);
  const projectFilterOptions = useMemo(
    () =>
      liveProjects.length
        ? ["All Projects", ...liveProjects.map((p) => p.project_name)]
        : PROJECT_FILTER_OPTIONS,
    [liveProjects],
  );
  const projectSelectOptions = useMemo(
    () => projectFilterOptions.map((p) => ({ label: p, value: p })),
    [projectFilterOptions],
  );

  // Refresh button — refetch is wired below, once the layer's query objects
  // exist (see handleRefresh near the query declarations).
  const [refreshing, setRefreshing] = useState(false);

  // Platform/device selector → the existing `device_type` API filter. Mirrors
  // the reference FM Matrix `deviceParam` mapping: "all" sends no device_type,
  // iOS/Android send the capitalised platform value the analytics host expects.
  const devices = useMemo(
    () =>
      deviceFilter === "ios"
        ? ["iOS"]
        : deviceFilter === "android"
        ? ["Android"]
        : [],
    [deviceFilter],
  );

  const rangeFilters = useMemo(
    () => ({ ...rangeForDays(DEFAULT_WINDOW), devices }),
    [devices],
  );
  const crashTrendFilters = useMemo(
    () => ({ ...rangeFilters, days: 7 }),
    [rangeFilters],
  );
  const trendFilters = useMemo(
    () => ({ to: rangeFilters.to, weeks: TREND_WEEKS, devices }),
    [rangeFilters.to, devices],
  );
  const growthFilters = useMemo(
    () => ({ to: rangeFilters.to, weeks: GROWTH_WEEKS, devices }),
    [rangeFilters.to, devices],
  );
  const retentionFilters = useMemo(
    () => ({ to: rangeFilters.to, weeks: RETENTION_WEEKS, devices }),
    [rangeFilters.to, devices],
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
      } else if (layer === "stability") {
        refetches.push(
          crashOverviewQuery.refetch(),
          crashTrendQuery.refetch(),
          crashReleaseQuery.refetch(),
          crashDiagnosticsQuery.refetch(),
          crashHandledFailuresQuery.refetch(),
        );
      }
      await Promise.all(refetches);
    } finally {
      setRefreshing(false);
    }
  };

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
    const keyFor = (k) =>
      ({
        active_users: "traffic.active_users",
        screen_views: "traffic.screen_views",
        sessions: "traffic.sessions",
        avg_session_seconds: "traffic.avg_session",
        bounce_rate: "traffic.bounce_rate",
      })[k] || null;
    return [
      ...traffic.tiles.map((tile) => ({
        label: tile.label,
        value: tile.value,
        key: tile.key,
        sub: tile.caption || "Selected period",
        infoKey: keyFor(tile.key),
      })),
      {
        label: "Recently Online",
        value: traffic.recentlyOnline,
        sub: "Active in last 30 min",
        infoKey: "traffic.recently_online",
      },
    ];
  }, [traffic, trafficQuery.data]);

  // Visitors/Views/Sessions trend, with a "previous period" dashed
  // comparison line - both current and previous come straight out of
  // usage.daily (buildUsage already aligns them day-for-day), switched by
  // the usageTab toggle. Falls back to the illustrative sample trends above
  // until the live endpoint resolves.
  const usageSeries = useMemo(() => {
    if (usageQuery.data) {
      return {
        current: usage.daily.map((day) => ({ label: day.day, count: day.current[usageTab] })),
        previous: usage.daily.map((day) => ({ label: day.day, count: day.previous[usageTab] })),
      };
    }
    return SAMPLE_USAGE_TRENDS[usageTab];
  }, [usage, usageQuery.data, usageTab]);

  // Card is specifically "Android vs iOS usage" — always show both rows, even
  // when the live payload only reports one platform (or an unrelated one like
  // "Desktop"); a platform missing from the live data is shown as 0%, never
  // dropped from the chart.
  const deviceSplit = useMemo(() => {
    if (usageQuery.data) {
      const shareByLabel = Object.fromEntries(
        usage.devices.map((device) => [device.label, device.share || 0]),
      );
      return ["Android", "iOS"].map((label) => ({
        label,
        value: shareByLabel[label] || 0,
        color: DEVICE_SPLIT_COLORS[label],
      }));
    }
    return DEVICE_SPLIT;
  }, [usage, usageQuery.data]);

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
      return {
        labels: SAMPLE_GROWTH_LABELS,
        series: SAMPLE_GROWTH_SERIES,
        negSeries: SAMPLE_GROWTH_DORMANT,
      };
    }
    const labels = weeks.map(
      (w, i) => w.week_label || w.week_start || w.week || w.label || w.date || `W${i + 1}`,
    );
    const pick = (key) => weeks.map((w) => Number(w?.[key] ?? 0));
    return {
      labels,
      series: [
        { label: "New", color: VIZ.brand, data: pick("new") },
        { label: "Returning", color: "#1c6b3f", data: pick("returning") },
        { label: "Resurrecting", color: "#5fb98a", data: pick("resurrected") },
      ],
      negSeries: { label: "Dormant", color: VIZ.brand2, data: pick("dormant") },
    };
  }, [growth, growthQuery.data]);

  const adoptionTiles = useMemo(() => {
    if (!adoptionQuery.data) return ADOPTION_TILES;
    return [
      {
        label: adoption.seat.label,
        value: adoption.seat.display,
        sub: adoption.seat.sub,
        infoKey: "adoption.seat",
      },
      {
        label: adoption.stickiness.label,
        value: adoption.stickiness.display,
        sub: adoption.stickiness.sub,
        infoKey: "adoption.stickiness",
      },
      {
        label: adoption.adoptionTrend.label,
        value: adoption.adoptionTrend.display,
        sub: adoption.adoptionTrend.sub,
        infoKey: "adoption.trend",
      },
      {
        label: adoption.activation.label,
        value: adoption.activation.display,
        sub: adoption.activation.sub,
        infoKey: "adoption.activation",
      },
      {
        label: adoption.moduleBreadth.label,
        value: adoption.moduleBreadth.display,
        sub: "modules used this period",
        infoKey: "adoption.module_breadth",
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

  const stabilityTiles = useMemo(() => {
    if (!crashOverviewQuery.data) return CRASH_TILES;
    return crashOverview.tiles.map((t) => ({
      ...t,
      infoKey:
        {
          "Crash-Free Users": "stability.crash_free_users",
          "Crash-Free Sessions": "stability.crash_free_sessions",
          "Total Crashes": "stability.total_crashes",
          "Affected Users": "stability.affected_users",
          "Latest Release": "stability.latest_release",
        }[t.label] || null,
    }));
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

  const healthTiles = useMemo(() => {
    const rows = crashDiagnosticsQuery.data ? crashDiagnostics.health : HEALTH_TILES;
    return rows.map((t) => ({
      ...t,
      infoKey:
        {
          "API Timeout Rate": "health.api_timeout",
          "Offline-Blocked Actions": "health.offline_blocked",
          "Rooted / Jailbroken Devices": "health.rooted_devices",
          "Slow API Response (p90)": "health.slow_api",
        }[t.label] || null,
    }));
  }, [crashDiagnosticsQuery.data, crashDiagnostics.health]);

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
    <>
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

          {/* Filter bar — matches Panchshil_Connect_Dashboard_v3_FM_structure.html's
              filterbar in structure and controls, in this page's own colours.
              Display-only: it does not feed rangeFilters/growthFilters/etc.
              above, so it can't change what the live queries request. */}
          <div className="pud-filterbar">
            <div className="pud-daterange">
              <button
                type="button"
                className="pud-ctrl"
                onClick={() => setDateRangeOpen((o) => !o)}
              >
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
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                      />
                      <span className="pud-dr-to">–</span>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                      />
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

            <div className="pud-ctrl pud-project-ctrl">
              <span className="pud-ic">🏢</span>
              <Select
                classNamePrefix="pud-project-select"
                options={projectSelectOptions}
                value={
                  projectSelectOptions.find((o) => o.value === projectFilter) ||
                  projectSelectOptions[0]
                }
                onChange={(opt) => setProjectFilter(opt?.value || "All Projects")}
                isSearchable
                maxMenuHeight={280}
                menuPortalTarget={document.body}
                styles={PROJECT_SELECT_STYLES}
              />
            </div>

            <div className="pud-devtoggle" title="Platform">
              <button
                type="button"
                className={deviceFilter === "all" ? "is-on" : ""}
                onClick={() => setDeviceFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={deviceFilter === "ios" ? "is-on" : ""}
                title="iOS only"
                onClick={() => setDeviceFilter("ios")}
              >
                iOS
              </button>
              <button
                type="button"
                className={deviceFilter === "android" ? "is-on" : ""}
                title="Android only"
                onClick={() => setDeviceFilter("android")}
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
              <span>
                {trafficTiles.find((t) => t.label === "Recently Online")?.value ?? 0} recently
                online
              </span>
            </span>
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

              <div
                className="pcd-tiles"
                style={{ marginTop: 16, gridTemplateColumns: `repeat(${trafficTiles.length}, 1fr)` }}
              >
                {trafficTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                    infoKey={t.infoKey}
                    onInfo={openInfoPopover}
                  />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-2">
                    <ChartCard
                      title="Usage over time"
                      subtitle="Last 24 days"
                      infoKey="chart.usage"
                      onInfo={openInfoPopover}
                    >
                    <div className="pud-devtoggle" style={{ marginBottom: 10 }}>
                      <button
                        type="button"
                        className={usageTab === "visitors" ? "is-on" : ""}
                        onClick={() => setUsageTab("visitors")}
                      >
                        Visitors
                      </button>
                      <button
                        type="button"
                        className={usageTab === "views" ? "is-on" : ""}
                        onClick={() => setUsageTab("views")}
                      >
                        Views
                      </button>
                      <button
                        type="button"
                        className={usageTab === "sessions" ? "is-on" : ""}
                        onClick={() => setUsageTab("sessions")}
                      >
                        Sessions
                      </button>
                    </div>
                    <AreaChart points={usageSeries.current} previousPoints={usageSeries.previous} />
                    <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12, color: "var(--pcd-muted)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <span
                          style={{ width: 9, height: 9, borderRadius: 2, background: VIZ.brand, display: "inline-block" }}
                        />
                        {usageTab === "visitors" ? "Visitors" : usageTab === "views" ? "Views" : "Sessions"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 16, height: 0, borderTop: "2px dashed #c2c0bd", display: "inline-block" }} />
                        Previous period
                      </span>
                    </div>
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Android vs iOS usage"
                    subtitle="Share of active users, Android vs iOS"
                    infoKey="chart.device"
                    onInfo={openInfoPopover}
                  >
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

              <div
                className="pcd-tiles"
                style={{ marginTop: 16, gridTemplateColumns: `repeat(${adoptionTiles.length}, 1fr)` }}
              >
                {adoptionTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                    infoKey={t.infoKey}
                    onInfo={openInfoPopover}
                  />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard title="Adoption trend (weekly active users, last 8 weeks)" infoKey="chart.adoptTrend" onInfo={openInfoPopover}>
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
                    subtitle="Growth accounting · Last 6 weeks"
                    infoKey="chart.growth"
                    onInfo={openInfoPopover}
                  >
                    <DivergingStackedBarChart
                      labels={growthWeekly.labels}
                      series={growthWeekly.series}
                      negSeries={growthWeekly.negSeries}
                    />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard
                    title="Do new users keep coming back?"
                    subtitle="% of each cohort still active N weeks later"
                    infoKey="chart.retention"
                    onInfo={openInfoPopover}
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
                    title="Who is (and isn't) using the app"
                    subtitle="Active users ÷ invited users"
                    infoKey="chart.role"
                    onInfo={openInfoPopover}
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
                    label="Dormant users"
                    value={adoptionQuery.data ? adoption.dormant.value : 312}
                    caption={
                      adoptionQuery.data
                        ? `No activity ${adoption.dormant.band}`
                        : `No activity 14+ days, vs. estimated ${REGISTERED_RESIDENTS.toLocaleString()} registered residents`
                    }
                    infoKey="adoption.dormant"
                    onInfo={openInfoPopover}
                  />
                </div>

                <div className="pcd-span-4">
                  <ChartCard eyebrow="League table" title="Site-wise breakdown" infoKey="chart.siteHealth" onInfo={openInfoPopover}>
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
                                  <span className={`pcd-cell-pill ${statusClass[row.status]}`}>
                                    {row.status}
                                  </span>
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

              <div className="pcd-tiles" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <Tile
                  label="Workflow Adoption"
                  value={`${
                    workflowQuery.data
                      ? liveWorkflow.kpis.fAdopt.value
                      : wf.adoption
                  }%`}
                  sub="of active users attempt this workflow"
                  infoKey="workflow.adoption"
                  onInfo={openInfoPopover}
                />
                <Tile
                  label="Completion Rate"
                  value={`${
                    workflowQuery.data
                      ? liveWorkflow.kpis.fComp.value
                      : wf.completionRate
                  }%`}
                  sub="of those who start it, finish it"
                  infoKey="workflow.completion"
                  onInfo={openInfoPopover}
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
                  infoKey="workflow.biggest_step_drop"
                  onInfo={openInfoPopover}
                />
                <Tile
                  label="Usage Volume"
                  value={String(
                    workflowQuery.data
                      ? liveWorkflow.kpis.fVol.value
                      : wf.completions,
                  )}
                  sub="completions this period"
                  infoKey="workflow.usage_volume"
                  onInfo={openInfoPopover}
                />
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard
                    title={`${wf.name} — completion funnel`}
                    subtitle="Real event sequence, illustrative retained %"
                    infoKey="chart.funnel"
                    onInfo={openInfoPopover}
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
                    title="All screens in this module"
                    subtitle="Users, events, sessions and completion per screen"
                    infoKey="chart.flowList"
                    onInfo={openInfoPopover}
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
                    title="Top entry screens"
                    subtitle="First screen seen in a session, org-wide (not module-filtered)"
                    infoKey="chart.path"
                    onInfo={openInfoPopover}
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

              <div
                className="pcd-tiles"
                style={{ marginTop: 16, gridTemplateColumns: `repeat(${stabilityTiles.length}, 1fr)` }}
              >
                {stabilityTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                    infoKey={t.infoKey}
                    onInfo={openInfoPopover}
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
              <div className="pcd-tiles" style={{ gridTemplateColumns: `repeat(${healthTiles.length}, 1fr)` }}>
                {healthTiles.map((t) => (
                  <Tile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                    infoKey={t.infoKey}
                    onInfo={openInfoPopover}
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
      <InfoPopover state={infoPopover} onClose={closeInfoPopover} />
    </>
  );
};

export default PanchshilConnectUsageDashboard;
