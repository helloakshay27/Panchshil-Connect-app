import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Link } from "react-router-dom";
import { baseURL, LOGO_URL } from "./baseurl/apiDomain";
import {
  ChartCard,
  GroupedHBar,
  HeatMap,
  KpiRibbon,
  SectionHead,
  SwitchableChart,
  VIZ,
} from "../components/dashboard/DashboardCharts";
import DataTable from "../components/dashboard/DataTable";
import { AiAlerts, AiGreeting } from "../components/dashboard/AiPanels";
import ActivityBoard from "../components/dashboard/ActivityBoard";
import "./panchshil-connect-dashboard.css";

/* Endpoints backed by PanchshilConnectDashboardController. */
const EP = {
  projectNames: "project_names",
  enquiries: "project_wise_enquiries",
  visits: "project_wise_schedule_visits",
  likes: "project_likes",
  amenities: "project_wise_amenities",
  propertyTypes: "property_wise_projects",
  salesBuilding: "sales_and_building_types",
  services: "category_wise_services",
  featured: "featured_projects_status",
  enquiryHours: "project_wise_enquiry_peak_hours",
  visitHours: "project_wise_site_visit_peak_hours",
  aiGreeting: "ai_greeting",
  aiAlerts: "ai_alerts",
  recentActivity: "recent_activity",
};

/* Master / tabular report endpoints - paginated, and exportable to xlsx. */
const REPORTS = [
  { key: "projects", label: "Project Details", path: "project_details_table" },
  { key: "enquiries", label: "Enquiry Details", path: "enquiry_details_table" },
  { key: "visits", label: "Site Visit Details", path: "site_visit_details_table" },
  { key: "events", label: "Event Details", path: "event_details_table" },
];

/* The token saved at sign-in; every dashboard call is authenticated with it. */
const authToken = () =>
  localStorage.getItem("access_token") || sessionStorage.getItem("access_token") || "";

const api = (path, params, signal) =>
  axios.get(`${baseURL.replace(/\/+$/, "")}/panchshil_connect_dashboard/${path}.json`, {
    params,
    signal,
    headers: { Authorization: `Bearer ${authToken()}` },
  });

const HEAT_ROWS = 8;
/* How often the activity rail re-checks for new records. Polling only runs
   while the tab is visible, so a backgrounded tab costs nothing. */
const ACTIVITY_POLL_MS = 60000;
const nf = new Intl.NumberFormat("en-IN");

/* Local-date YYYY-MM-DD. toISOString() would convert to UTC first, which in
   IST (+05:30) rolls a local midnight back to the previous day - so the 1st of
   the month would go out as the 30th/31st of the previous one. */
const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* The dashboard opens on the current month across all projects. */
const monthRange = () => {
  const now = new Date();
  return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
};
const DEFAULTS = monthRange();

/* Every project-wise endpoint returns the same { projects: [...] } envelope,
   differing only in the count field's name. */
const projectBars = (payload, field) =>
  (payload?.projects || []).map((p) => ({
    key: p.project_id,
    label: p.project_name,
    value: p[field],
  }));

const selectStyles = {
  control: (b, s) => ({
    ...b,
    minHeight: 34,
    fontSize: 13,
    borderColor: s.isFocused ? VIZ.brand : "#e7e5e4",
    boxShadow: s.isFocused ? `0 0 0 1px ${VIZ.brand}` : "none",
    "&:hover": { borderColor: VIZ.brand },
  }),
  multiValue: (b) => ({ ...b, background: "#fdf1e4", borderRadius: 4 }),
  multiValueLabel: (b) => ({ ...b, color: "#8a4605", fontSize: 12 }),
  multiValueRemove: (b) => ({
    ...b,
    color: "#8a4605",
    ":hover": { background: VIZ.brand, color: "#fff" },
  }),
  option: (b, s) => ({
    ...b,
    fontSize: 13,
    background: s.isSelected ? VIZ.brand : s.isFocused ? "#fdf1e4" : "#fff",
    color: s.isSelected ? "#fff" : "#1f2933",
  }),
  placeholder: (b) => ({ ...b, fontSize: 13, color: "#98a2b3" }),
  menuPortal: (b) => ({ ...b, zIndex: 60 }),
};

const PanchshilConnectDashboard = () => {
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  /* Which view is showing: the charts, or the tabular reports. */
  const [tab, setTab] = useState("visualization");

  /* Tabular-reports state - fetched lazily, only while that tab is open. */
  const [report, setReport] = useState("projects");
  const [reportPage, setReportPage] = useState(1);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [exporting, setExporting] = useState(false);

  /* AI panels - greeting (filter-independent) and alerts (filter-aware). */
  const [greeting, setGreeting] = useState(null);
  const [greetingLoading, setGreetingLoading] = useState(true);
  const [alerts, setAlerts] = useState(null);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [alertsNonce, setAlertsNonce] = useState(0);

  /* Recent-activity board - intentionally unfiltered. */
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const [activityNonce, setActivityNonce] = useState(0);
  const [railOpen, setRailOpen] = useState(true);
  const [activityUpdatedAt, setActivityUpdatedAt] = useState(null);
  /* First load shows skeletons; every later refresh is silent so the rail
     does not flicker while you are reading it. */
  const activityLoadedOnce = useRef(false);

  /* Opens on the current month, all projects. */
  const [fromDate, setFromDate] = useState(DEFAULTS.from);
  const [toDate, setToDate] = useState(DEFAULTS.to);
  const [preset, setPreset] = useState("month");

  const [applied, setApplied] = useState({
    projectIds: "",
    fromDate: DEFAULTS.from,
    toDate: DEFAULTS.to,
  });
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- project list for the filter ---------------- */
  useEffect(() => {
    const ac = new AbortController();
    api(EP.projectNames, {}, ac.signal)
      .then(({ data: d }) =>
        setProjectOptions((d.projects || []).map((p) => ({ value: p.id, label: p.name })))
      )
      .catch((e) => {
        if (!axios.isCancel(e)) console.error("project_names failed", e);
      });
    return () => ac.abort();
  }, []);

  /* Greeting does not depend on the filters, so it is fetched once. */
  useEffect(() => {
    const ac = new AbortController();
    api(EP.aiGreeting, {}, ac.signal)
      .then(({ data: d }) => setGreeting(d))
      .catch((e) => {
        if (!axios.isCancel(e)) setGreeting(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setGreetingLoading(false);
      });
    return () => ac.abort();
  }, []);

  /* Recent activity does not FILTER on the project/date selection, but it does
     refetch when you hit Apply, so newly created records show up. It also
     polls while the tab is visible and refreshes when you return to the tab. */
  useEffect(() => {
    const ac = new AbortController();
    if (!activityLoadedOnce.current) setActivityLoading(true);
    setActivityError(null);

    api(EP.recentActivity, { limit: 5 }, ac.signal)
      .then(({ data: d }) => {
        setActivity(d);
        setActivityUpdatedAt(new Date());
        activityLoadedOnce.current = true;
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        /* Keep whatever is on screen if a background refresh fails. */
        if (!activityLoadedOnce.current) setActivity(null);
        setActivityError("Could not load recent activity.");
      })
      .finally(() => {
        if (!ac.signal.aborted) setActivityLoading(false);
      });

    return () => ac.abort();
  }, [activityNonce, applied]);

  /* Poll while visible, and catch up immediately on tab focus. */
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") setActivityNonce((n) => n + 1);
    };
    const id = setInterval(tick, ACTIVITY_POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, []);

  /* ---------------- dashboard payloads ---------------- */
  const fetchAll = useCallback((filters, signal) => {
    setLoading(true);
    setError(null);

    const scoped = {};
    if (filters.projectIds) scoped.project_id = filters.projectIds;
    if (filters.fromDate) scoped.from_date = filters.fromDate;
    if (filters.toDate) scoped.to_date = filters.toDate;

    /* These two have no project linkage server-side - date range only. */
    const dateOnly = {};
    if (filters.fromDate) dateOnly.from_date = filters.fromDate;
    if (filters.toDate) dateOnly.to_date = filters.toDate;

    const calls = [
      ["enquiries", EP.enquiries, scoped],
      ["visits", EP.visits, scoped],
      ["likes", EP.likes, scoped],
      ["amenities", EP.amenities, scoped],
      ["propertyTypes", EP.propertyTypes, scoped],
      ["salesBuilding", EP.salesBuilding, scoped],
      ["services", EP.services, dateOnly],
      ["featured", EP.featured, dateOnly],
      ["enquiryHours", EP.enquiryHours, scoped],
      ["visitHours", EP.visitHours, scoped],
    ];

    Promise.allSettled(calls.map(([, path, p]) => api(path, p, signal))).then((results) => {
      if (signal?.aborted) return;
      const next = {};
      let failures = 0;
      results.forEach((res, i) => {
        const key = calls[i][0];
        if (res.status === "fulfilled") next[key] = res.value.data;
        else {
          failures += 1;
          next[key] = { __error: true };
        }
      });
      setData(next);
      if (failures === calls.length)
        setError("Could not load dashboard data — check that you are signed in and the API is up.");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchAll(applied, ac.signal);
    return () => ac.abort();
  }, [applied, fetchAll]);

  /* Alerts follow the same filters as the charts. */
  useEffect(() => {
    const ac = new AbortController();
    const p = {};
    if (applied.projectIds) p.project_id = applied.projectIds;
    if (applied.fromDate) p.from_date = applied.fromDate;
    if (applied.toDate) p.to_date = applied.toDate;

    setAlertsLoading(true);
    setAlertsError(null);
    api(EP.aiAlerts, p, ac.signal)
      .then(({ data: d }) => setAlerts(d))
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setAlertsError("Could not generate insights right now.");
        setAlerts(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setAlertsLoading(false);
      });
    return () => ac.abort();
  }, [applied, alertsNonce]);

  /* ---------------- tabular reports ----------------
     Fetched only while the reports tab is open, so opening the dashboard
     never pays for table queries it will not show. */
  const reportParams = useCallback(
    (extra = {}) => {
      const p = { ...extra };
      if (applied.projectIds) p.project_id = applied.projectIds;
      if (applied.fromDate) p.from_date = applied.fromDate;
      if (applied.toDate) p.to_date = applied.toDate;
      return p;
    },
    [applied]
  );

  useEffect(() => {
    if (tab !== "tables") return undefined;
    const ac = new AbortController();
    const def = REPORTS.find((r) => r.key === report);
    setReportLoading(true);
    setReportError(null);

    api(def.path, reportParams({ page: reportPage, per_page: 20 }), ac.signal)
      .then(({ data: d }) => setReportData(d))
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setReportError("Could not load this report. Please retry.");
        setReportData(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setReportLoading(false);
      });

    return () => ac.abort();
  }, [tab, report, reportPage, reportParams]);

  /* Filters or report changed -> back to the first page. */
  useEffect(() => setReportPage(1), [report, applied]);

  /* The export needs the auth header, so it cannot be a plain link - fetch the
     xlsx as a blob and hand it to the browser. */
  const onExport = async () => {
    const def = REPORTS.find((r) => r.key === report);
    setExporting(true);
    try {
      const res = await axios.get(
        `${baseURL.replace(/\/+$/, "")}/panchshil_connect_dashboard/${def.path}.json`,
        {
          params: reportParams({ export: true }),
          responseType: "blob",
          headers: { Authorization: `Bearer ${authToken()}` },
        }
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${def.path}_${iso(new Date())}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setReportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /* ---------------- filter actions ----------------
     Day / Month prefill the dates, Range clears them so the user picks, and
     All hides the inputs entirely because no date range is sent. */
  const applyPreset = (key) => {
    setPreset(key);
    const now = new Date();
    if (key === "day") {
      const d = iso(now);
      setFromDate(d);
      setToDate(d);
    } else if (key === "month") {
      setFromDate(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
      setToDate(iso(now));
    } else {
      // "range" (user picks) and "all" (no dates sent) both start empty
      setFromDate("");
      setToDate("");
    }
  };

  const showDates = preset !== "all";

  const onApply = () =>
    setApplied({
      projectIds: selectedProjects.map((p) => p.value).join(","), // ids out, names shown
      fromDate,
      toDate,
    });

  /* Reset returns to the opening view (current month, all projects) rather
     than to an empty filter set. */
  const onReset = () => {
    const d = monthRange();
    setSelectedProjects([]);
    setFromDate(d.from);
    setToDate(d.to);
    setPreset("month");
    setApplied({ projectIds: "", fromDate: d.from, toDate: d.to });
  };

  const dateInvalid = Boolean(fromDate && toDate && fromDate > toDate);

  /* ---------------- derived rows ---------------- */
  const err = (k) => (data[k]?.__error ? "Failed to load" : null);

  const enquiryRows = useMemo(() => projectBars(data.enquiries, "enquiries_count"), [data]);
  const visitRows = useMemo(() => projectBars(data.visits, "count"), [data]);
  const likeRows = useMemo(() => projectBars(data.likes, "likes_count"), [data]);
  const amenityRows = useMemo(() => projectBars(data.amenities, "amenities_count"), [data]);

  const propertyRows = useMemo(
    () =>
      (data.propertyTypes?.property_types || []).map((r) => ({
        label: r.property_type,
        value: r.count,
      })),
    [data]
  );
  const salesRows = useMemo(
    () =>
      (data.salesBuilding?.sales_types || []).map((r) => ({ label: r.sales_type, value: r.count })),
    [data]
  );
  const buildingRows = useMemo(
    () =>
      (data.salesBuilding?.building_types || []).map((r) => ({
        label: r.building_type,
        value: r.count,
      })),
    [data]
  );
  const featuredRows = useMemo(
    () => (data.featured?.statuses || []).map((r) => ({ label: r.status, value: r.count })),
    [data]
  );
  const serviceRows = useMemo(
    () =>
      (data.services?.categories || []).map((c) => ({
        label: c.category_name,
        a: c.services_count,
        b: c.active_services_count,
      })),
    [data]
  );

  const heatRows = (key) => (data[key]?.projects || []).slice(0, HEAT_ROWS);
  const hourLabels = useMemo(() => {
    const src = data.enquiryHours?.hourly_totals || data.visitHours?.hourly_totals || [];
    return src.map((h) => ({ hour: h.hour, label: h.label }));
  }, [data]);

  const enquiryHourly = useMemo(() => data.enquiryHours?.hourly_totals || [], [data]);
  const visitHourly = useMemo(() => data.visitHours?.hourly_totals || [], [data]);
  const hourlyRows = (pts) => pts.filter((h) => h.count > 0).map((h) => ({ label: h.label, value: h.count }));

  const peak = (key) => data[key]?.peak_hour;
  const rangeCaption = applied.fromDate || applied.toDate
    ? `${applied.fromDate || "start"} → ${applied.toDate || "today"}`
    : "All time";

  /* ---------------- ribbon ----------------
     The single KPI layer. Nothing below it restates these numbers. */
  const pk = (k) => (peak(k)?.count ? peak(k) : null);
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  const ribbon = [
    {
      label: "Enquiries",
      value: nf.format(data.enquiries?.total_enquiries ?? 0),
      sub: plural(data.enquiries?.total_projects ?? 0, "project"),
      /* the hour is the headline here, the count is the qualifier */
      note: pk("enquiryHours") ? `Peak ${pk("enquiryHours").label} · ${pk("enquiryHours").count}` : null,
    },
    {
      label: "Scheduled Visits",
      value: nf.format(data.visits?.total_visits ?? 0),
      sub: plural(data.visits?.total_projects ?? 0, "project"),
      note: pk("visitHours")
        ? `Peak ${pk("visitHours").label} · ${pk("visitHours").count}`
        : data.visitHours?.unslotted_count
        ? `${data.visitHours.unslotted_count} without slot`
        : null,
    },
    {
      label: "Project Likes",
      value: nf.format(data.likes?.total_likes ?? 0),
      sub: plural(data.likes?.total_projects ?? 0, "project"),
    },
    {
      label: "Amenities",
      value: nf.format(data.amenities?.total_amenities ?? 0),
      sub: plural(data.amenities?.total_projects ?? 0, "project"),
    },
    {
      label: "Projects in scope",
      value: nf.format(data.propertyTypes?.total_projects ?? 0),
      sub: plural(data.propertyTypes?.total_property_types ?? 0, "property type"),
    },
    /* The two below are NOT project-filtered: plus_services has no project
       linkage at all server-side, and the status endpoint takes only a date
       range. Labelled "Overall" so the numbers are never read as belonging to
       the selected projects. */
    {
      label: "Overall Privileges",
      value: nf.format(data.services?.total_services ?? 0),
      sub: `${data.services?.total_active_services ?? 0} active`,
      note: "All projects · not filtered",
      muted: true,
    },
    {
      /* Upcoming and Sold Out come from different columns and do not
         partition the set, so they are shown side by side, never summed. */
      label: "Overall Project Status",
      value: featuredRows.map((r) => r.value).join(" / ") || "—",
      sub: featuredRows.map((r) => r.label).join(" / ") || "—",
      note: "All projects · not filtered",
      muted: true,
    },
  ];

  return (
    <div className="pcd-page">
      {/* ---------------- sticky header ---------------- */}
      <header className="pcd-topbar">
        <div className="pcd-brand">
          <img src={LOGO_URL} alt="Panchshil" />
          <div>
            <strong>Panchshil Connect</strong>
            <span>Engagement Dashboard</span>
          </div>
        </div>

        <div className="pcd-controls">
          <div className="pcd-seg">
            {[
              ["day", "Day"],
              ["month", "Month"],
              ["range", "Range"],
              ["all", "All"],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={preset === k ? "is-on" : ""}
                onClick={() => applyPreset(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {showDates ? (
            <div className="pcd-daterange">
              <label className="pcd-date">
                <span>From</span>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPreset("range");
                  }}
                />
              </label>
              <i className="pcd-dash" aria-hidden="true" />
              <label className="pcd-date">
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPreset("range");
                  }}
                />
              </label>
            </div>
          ) : (
            <span className="pcd-alltime">No date filter — all time</span>
          )}

          <div className="pcd-projsel">
            <Select
              inputId="pcd-projects"
              isMulti
              options={projectOptions}
              value={selectedProjects}
              onChange={(v) => setSelectedProjects(v || [])}
              placeholder="All projects"
              styles={selectStyles}
              closeMenuOnSelect={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            />
          </div>

          <button
            type="button"
            className="pcd-btn pcd-btn-primary"
            onClick={onApply}
            disabled={dateInvalid || loading}
          >
            {loading ? "Loading…" : "Apply"}
          </button>
          <button type="button" className="pcd-btn pcd-btn-ghost" onClick={onReset}>
            Reset
          </button>
          <Link to="/panchshil_connect_dashboard/usage" className="pcd-btn pcd-btn-primary">
            Usage Dashboard
          </Link>
        </div>

        <Link to="/" className="pcd-back">
          ← Back to Web App
        </Link>
      </header>

      <main className="pcd">
        {dateInvalid ? (
          <div className="pcd-note">“From date” must be on or before “To date”.</div>
        ) : null}
        {error ? <div className="pcd-note pcd-note-error">{error}</div> : null}

        <AiGreeting data={greeting} loading={greetingLoading} />

        <div className="pcd-scope">
          <span>Showing</span>
          <b>{applied.projectIds ? `${applied.projectIds.split(",").length} selected projects` : "all projects"}</b>
          <span>·</span>
          <b>{rangeCaption}</b>
        </div>

        <KpiRibbon items={ribbon} loading={loading} />

        {/* Main column on the left, activity rail spanning the full height
            on the right - collapsible so the charts can take the full width. */}
        <div className={`pcd-shell ${railOpen ? "" : "is-collapsed"}`}>
          <div className="pcd-main">
            <AiAlerts
              data={alerts}
              loading={alertsLoading}
              error={alertsError}
              onRetry={() => setAlertsNonce((n) => n + 1)}
            />

        {/* ---------------- view tabs ---------------- */}
        <div className="pcd-tabs" role="tablist">
          {[
            ["visualization", "Visualization"],
            ["tables", "Tabular Reports"],
          ].map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={tab === k ? "is-on" : ""}
              onClick={() => setTab(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "tables" ? (
          <>
            <div className="pcd-subtabs">
              {REPORTS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={report === r.key ? "is-on" : ""}
                  onClick={() => setReport(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <DataTable
              columns={reportData?.columns || []}
              rows={reportData?.rows || []}
              pagination={reportData?.pagination}
              loading={reportLoading}
              error={reportError}
              onPage={setReportPage}
              onExport={onExport}
              exporting={exporting}
            />
          </>
        ) : (
          <>
        {/* ================= ENGAGEMENT ================= */}
        <SectionHead title="Engagement — what users are doing" />
        <div className="pcd-grid">
          
          <div className="pcd-span-2">
            <ChartCard
              title="Enquiries by Project"
              subtitle="Enquiry forms submitted"
              loading={loading}
              error={err("enquiries")}
              empty={!enquiryRows.length}
            >
              <SwitchableChart
                rows={enquiryRows}
                types={["bar", "column", "table"]}
                tableCols={["Project", "Enquiries"]}
              />
            </ChartCard>
          </div>

          
          <div className="pcd-span-2">
            <ChartCard
              title="Scheduled Visits by Project"
              loading={loading}
              error={err("visits")}
              empty={!visitRows.length}
            >
              <SwitchableChart
                rows={visitRows}
                types={["column", "bar", "table"]}
                tableCols={["Project", "Scheduled visits"]}
              />
            </ChartCard>
          </div>
          <div className="pcd-span-2">
            <ChartCard
              title="Likes by Project"
              subtitle="Favourited projects"
              loading={loading}
              error={err("likes")}
              empty={!likeRows.length}
            >
              <SwitchableChart
                rows={likeRows}
                types={["bar", "column", "table"]}
                tableCols={["Project", "Likes"]}
              />
            </ChartCard>
          </div>
          <div className="pcd-span-2">
            <ChartCard
              title="Amenities by Project"
              loading={loading}
              error={err("amenities")}
              empty={!amenityRows.length}
            >
              <SwitchableChart
                rows={amenityRows}
                types={["bar", "table"]}
                tableCols={["Project", "Amenities"]}
              />
            </ChartCard>
          </div>
        </div>

        {/* ================= PORTFOLIO ================= */}
        <SectionHead title="Portfolio — what is in the project mix" />
        <div className="pcd-grid">
          <div className="pcd-span-1">
            <ChartCard
              title="By Property Type"
              subtitle="Share of portfolio"
              loading={loading}
              error={err("propertyTypes")}
              empty={!propertyRows.length}
            >
              {/* 2 segments: share bar or bar — a 2-slice pie is an anti-pattern */}
              <SwitchableChart
                rows={propertyRows}
                types={["share", "bar", "table"]}
                tableCols={["Property type", "Projects"]}
              />
            </ChartCard>
          </div>
          <div className="pcd-span-1">
            <ChartCard
              title="By Sales Type"
              subtitle="Sales vs lease"
              loading={loading}
              error={err("salesBuilding")}
              empty={!salesRows.length}
            >
              <SwitchableChart
                rows={salesRows}
                types={["donut", "bar", "share", "table"]}
                unit="Projects"
                tableCols={["Sales type", "Projects"]}
              />
            </ChartCard>
          </div>
          <div className="pcd-span-1">
            <ChartCard
              title="By Building Type"
              loading={loading}
              error={err("salesBuilding")}
              empty={!buildingRows.length}
            >
              <SwitchableChart
                rows={buildingRows}
                types={["bar", "donut", "table"]}
                unit="Projects"
                tableCols={["Building type", "Projects"]}
              />
            </ChartCard>
          </div>
          <div className="pcd-span-1">
            <ChartCard
              title="Overall Project Status"
              subtitle="Upcoming vs sold out · all projects, not project-filtered"
              loading={loading}
              error={err("featured")}
              empty={!featuredRows.length}
            >
              <SwitchableChart
                rows={featuredRows}
                types={["column", "bar", "table"]}
                tableCols={["Status", "Projects"]}
              />
            </ChartCard>
          </div>

          <div className="pcd-span-4">
            <ChartCard
              title="Overall Privileges by Category"
              subtitle="Plus services per category · all projects, not project-filtered"
              legend={[
                { label: "Total", color: VIZ.brand },
                { label: "Active", color: VIZ.brand2 },
              ]}
              loading={loading}
              error={err("services")}
              empty={!serviceRows.length}
            >
              <GroupedHBar rows={serviceRows} />
            </ChartCard>
          </div>
          
        </div>

        {/* ================= TIMING ================= */}
        <SectionHead title="Timing — when the activity happens" />
        <div className="pcd-grid">
          <div className="pcd-span-2">
            <ChartCard
              title="Enquiries by Hour of Day"
              subtitle={
                peak("enquiryHours")?.count
                  ? `Peak ${peak("enquiryHours").label} · ${peak("enquiryHours").count}`
                  : "Across all projects in scope"
              }
              loading={loading}
              error={err("enquiryHours")}
              empty={!enquiryHourly.some((h) => h.count > 0)}
            >
              <SwitchableChart
                rows={hourlyRows(enquiryHourly)}
                linePoints={enquiryHourly}
                types={["line", "bar", "table"]}
                tableCols={["Hour", "Enquiries"]}
              />
            </ChartCard>
          </div>
          <div className="pcd-span-2">
            <ChartCard
              title="Scheduled Visits by Hour of Day"
              subtitle={
                peak("visitHours")?.count
                  ? `Peak ${peak("visitHours").label} · ${peak("visitHours").count}`
                  : "Scheduled slot times"
              }
              loading={loading}
              error={err("visitHours")}
              empty={!visitHourly.some((h) => h.count > 0)}
            >
              <SwitchableChart
                rows={hourlyRows(visitHourly)}
                linePoints={visitHourly}
                lineColor={VIZ.brand3}
                types={["line", "bar", "table"]}
                tableCols={["Hour", "Visits"]}
              />
            </ChartCard>
          </div>

          <div className="pcd-span-4">
            <ChartCard
              title="Enquiry Peak Hours"
              subtitle={`Top ${HEAT_ROWS} projects × hour of day`}
              loading={loading}
              error={err("enquiryHours")}
              empty={!heatRows("enquiryHours").length}
            >
              <HeatMap rows={heatRows("enquiryHours")} hourLabels={hourLabels} />
            </ChartCard>
          </div>

          <div className="pcd-span-4">
            <ChartCard
              title="Scheduled Visit Peak Hours"
              subtitle={`Top ${HEAT_ROWS} projects × slot hour`}
              loading={loading}
              error={err("visitHours")}
              empty={!heatRows("visitHours").length}
            >
              <HeatMap rows={heatRows("visitHours")} hourLabels={hourLabels} />
              {data.visitHours?.unslotted_count > 0 ? (
                <div className="pcd-note">
                  {data.visitHours.unslotted_count} scheduled visit
                  {data.visitHours.unslotted_count === 1 ? "" : "s"} have no resolvable slot time
                  and are not shown.
                </div>
              ) : null}
            </ChartCard>
          </div>
        </div>
          </>
        )}
          </div>

          <ActivityBoard
            data={activity}
            loading={activityLoading}
            error={activityError}
            onRetry={() => setActivityNonce((n) => n + 1)}
            updatedAt={activityUpdatedAt}
            collapsed={!railOpen}
            onToggle={() => setRailOpen((v) => !v)}
          />
        </div>
      </main>
    </div>
  );
};

export default PanchshilConnectDashboard;
