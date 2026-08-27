import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Rustomji_URL_Black } from "./baseurl/apiDomain";
import {
  ChartCard,
  StatTile,
  MetricCard,
  AreaChart,
  DonutChart,
  StackedShareBar,
} from "../components/dashboard/DashboardCharts";
import "./panchshil-connect-dashboard.css";
import "./panchshil-connect-usage-dashboard.css";
import "./rustomjee-connect-usage-dashboard.css";

/* Same layout/components as the Panchshil Connect Usage Dashboard (same CSS
   structure, same DashboardCharts components) — but its own colour code:
   Rustomjee's brand gold (#A78847) in place of Panchshil's orange (#de7008).
   `--pcd-brand/-2/-3` are overridden inline on the page root below, which
   re-colours everything in the shared CSS that reads those variables; chart
   components that take an explicit colour prop are passed RJ.* directly,
   since their own defaults are hardcoded to Panchshil orange. */
const RJ = {
  brand: "#A78847", // Rustomjee gold — primary
  brand2: "#7C6435", // deeper bronze — secondary
  brand3: "#3E6E64", // muted teal — cool contrast for a second data series
  cat: ["#A78847", "#7C6435", "#3E6E64"],
  ramp: ["#f8f3e6", "#efe3c4", "#e2c98f", "#cca962", "#A78847", "#7c6435", "#544425"],
};

const Tile = ({ label, value, sub }) => (
  <div className="pcd-tile">
    <div className="pcd-tile-label">{label}</div>
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
   Sample / illustrative data. Nothing on this page is wired to a real
   analytics endpoint yet — every number below is a stand-in until
   PostHog / Crashlytics is wired in for real. Module names, buckets and
   the booked-homebuyer ceiling are taken from
   Rustomjee_Circle_Dashboard_v1_FM_structure.html (the reference
   wireframe this page is modelled on); the figures themselves are not.
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

const GROWTH_ACCOUNTING = [
  { label: "New", value: 11 },
  { label: "Returning", value: 55 },
  { label: "Resurrecting", value: 6 },
  { label: "Dormant", value: 28 },
];

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
   illustrative. */
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
  const [layer, setLayer] = useState("traffic");
  const [wfKey, setWfKey] = useState("auth");
  const current = LAYERS.find((l) => l.key === layer);

  const wf = WORKFLOWS.find((w) => w.key === wfKey) || WORKFLOWS[0];
  const wfBucket = wf.bucket;
  const wfMods = WORKFLOWS.filter((w) => w.bucket === wfBucket);

  const funnelSteps = useMemo(() => {
    const n = wf.steps.length;
    return wf.steps.map((s, i) => {
      const retained = Math.round(100 - (i * (100 - wf.completionRate)) / (n - 1 || 1));
      return { step: s, retained };
    }).map((row, i, arr) => ({
      ...row,
      drop: i > 0 ? arr[i - 1].retained - row.retained : null,
    }));
  }, [wf]);

  const screenRows = useMemo(
    () =>
      funnelSteps.map((row) => {
        const users = Math.max(1, Math.round((wf.completions * row.retained) / 100));
        return {
          screen: row.step,
          users,
          events: Math.round(users * 1.4),
          sessions: Math.round(users * 0.9),
          completion: row.retained,
        };
      }),
    [funnelSteps, wf]
  );

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
          <span className="pcd-alltime">Illustrative &middot; sample data pending live analytics wiring</span>
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
                Sample data shown here is illustrative and not yet wired to a live analytics source
                for Rustomjee Circle. Figures will update once the traffic endpoint is connected.
              </SampleNote>

              <div className="pcd-tiles" style={{ marginTop: 16 }}>
                {TRAFFIC_TILES.map((t) => (
                  <StatTile key={t.label} label={t.label} value={t.value} sub={t.sub} />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-2">
                  <ChartCard title="Active Users Trend" subtitle="Last 24 days">
                    <AreaChart points={ACTIVE_USERS_TREND} color={RJ.brand} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard title="Device Platform Split" subtitle="Share of active users, Android vs iOS">
                    <DonutChart rows={DEVICE_SPLIT} centerLabel="Active Users" colors={RJ.cat} />
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
                Sample data shown here is illustrative and not yet wired to a live analytics source
                for Rustomjee Circle.
              </SampleNote>

              <div className="pcd-tiles" style={{ marginTop: 16 }}>
                {ADOPTION_TILES.map((t) => (
                  <Tile key={t.label} label={t.label} value={t.value} sub={t.sub} />
                ))}
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard title="Adoption Trend" subtitle="Weekly active users, last 8 weeks">
                    <AreaChart points={ADOPTION_TREND} color={RJ.brand} />
                  </ChartCard>
                </div>

                <div className="pcd-span-2">
                  <ChartCard
                    title="New · Returning · Resurrecting · Dormant"
                    subtitle="Share of the active base this week"
                  >
                    <StackedShareBar rows={GROWTH_ACCOUNTING} colors={RJ.cat} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <ChartCard title="Retention · Weekly Cohorts" subtitle="% of each cohort still active N weeks later">
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
                          {COHORT_ROWS.map((row) => (
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
                  <ChartCard title="Adoption by Audience" subtitle="Active users ÷ invited users">
                    <PercentHBar rows={ROLE_SPLIT} />
                  </ChartCard>
                </div>
                <div className="pcd-span-2">
                  <MetricCard
                    label="Dormant Users"
                    value={1240}
                    caption={`No activity 14+ days, vs. estimated ${BOOKED_HOMEBUYERS.toLocaleString()} booked homebuyers`}
                  />
                </div>

                <div className="pcd-span-4">
                  <ChartCard title="Site-Wise Breakdown" subtitle="Active users, sessions and bounce rate per live project">
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
                          {SITE_WISE.map((r) => (
                            <tr key={r.project}>
                              <td>{r.project}</td>
                              <td>{r.active}</td>
                              <td>{r.sessions}</td>
                              <td>{r.avgSession}</td>
                              <td>{r.bounce}%</td>
                              <td>{trendArrow[r.trend]}</td>
                              <td>
                                <span className={`pcd-cell-pill ${statusClass[r.status]}`}>{r.status}</span>
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
                Sample data shown here is illustrative — module names and buckets are real, from the
                shared PostHog event catalogue's Rustomjee sheet, but adoption/completion figures are
                not yet wired live.
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

              <div className="pcd-tiles">
                <Tile label="Workflow Adoption" value={`${wf.adoption}%`} sub="of active users attempt this workflow" />
                <Tile label="Completion Rate" value={`${wf.completionRate}%`} sub="of those who start it, finish it" />
                <Tile
                  label="Biggest Step Drop"
                  value={`${Math.max(...funnelSteps.slice(1).map((s) => s.drop))}%`}
                  sub={`at ${funnelSteps.slice(1).sort((a, b) => b.drop - a.drop)[0]?.step}`}
                />
                <Tile label="Usage Volume" value={String(wf.completions)} sub="completions this period" />
              </div>

              <div className="pcd-grid" style={{ marginTop: 14 }}>
                <div className="pcd-span-4">
                  <ChartCard title={`${wf.name} — Completion Funnel`} subtitle="Real event sequence, illustrative retained %">
                    <div className="pud-funnel">
                      {funnelSteps.map((row, i) => (
                        <div key={row.step}>
                          {i > 0 ? <div className="pud-funnel-drop">▼ {row.drop}% drop-off</div> : null}
                          <div
                            className="pud-funnel-step"
                            style={{ width: `${45 + (row.retained / 100) * 55}%`, opacity: 1 - i * 0.08 }}
                            title={`${row.step}: ${row.retained}% of entrants remain`}
                          >
                            {row.step}
                            <span className="pud-funnel-sub">{row.retained}% of entrants</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>

                <div className="pcd-span-4">
                  <ChartCard title="All Screens in This Module" subtitle="Users, events, sessions and completion per screen">
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
                  <ChartCard title="Top Entry Screens" subtitle="First screen seen in a session, org-wide (not module-filtered)">
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
                          {TOP_ENTRY_SCREENS.map((r) => (
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
