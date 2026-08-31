import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { LOGO_URL } from "../../pages/baseurl/apiDomain";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import {
  DATE_WINDOWS,
  DEVICE_TYPES,
} from "./data/constants";
import { ANALYTICS_QUERY_KEY } from "./api/queries";
import { ANALYTICS_TENANT } from "./api/adoptionApi";
import TrafficSection from "./sections/TrafficSection";
import AdoptionSection from "./sections/AdoptionSection";
import WorkflowSection from "./sections/WorkflowSection";
import "./PosthogDashboardPage.css";

const LAYERS = [
  { key: "traffic", label: "Traffic & Session" },
  { key: "adoption", label: "Adoption & Engagement" },
  { key: "workflow", label: "Workflow Usage" },
];

const FilterBar = () => {
  const d = useDashboard();
  const client = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await client.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY], refetchType: "active" });
    setTimeout(() => setRefreshing(false), 650);
  };

  const toggleDevice = (dev) => {
    d.setDevice(d.device === dev ? "All" : dev);
  };

  return (
    <div className="pcd-filters">
      <div className="pcd-field">
        <label>Date window</label>
        <select
          value={d.dateWindow}
          onChange={(e) => d.setDateWindow(Number(e.target.value))}
        >
          {DATE_WINDOWS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pcd-field">
        <label>Device</label>
        <div className="pcd-devseg">
          <button
            type="button"
            className={d.device === "All" ? "is-on" : ""}
            onClick={() => d.setDevice("All")}
          >
            All
          </button>
          {DEVICE_TYPES.map((dev) => (
            <button
              key={dev}
              type="button"
              className={d.device === dev ? "is-on" : ""}
              onClick={() => toggleDevice(dev)}
            >
              {dev}
            </button>
          ))}
        </div>
      </div>

      <div className="pcd-field">
        <label>Licensed seats</label>
        <input
          type="number"
          min={0}
          placeholder="(engaged only)"
          value={d.licensedSeats}
          onChange={(e) => d.setLicensedSeats(e.target.value)}
        />
      </div>

      <div className="pcd-actions" style={{ marginLeft: "auto" }}>
        <span className="pcd-alltime">
          {d.scopeLabel} · {d.dateLabel}
        </span>
        <button
          type="button"
          className="pcd-refresh"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <span className={refreshing ? "is-spinning" : ""}>↻</span>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </div>
  );
};

const DashboardBody = () => {
  const [layer, setLayer] = useState("traffic");

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
          <span className="pcd-alltime" title={`Analytics host: ${ANALYTICS_TENANT}`}>
            {ANALYTICS_TENANT}
          </span>
        </div>
        <Link to="/panchshil_connect_dashboard" className="pcd-back">
          ← Back to Web App
        </Link>
      </header>

      <div className="pcd">
        <FilterBar />

        <div className="pcd-scope">
          <span>Showing</span> <ScopeLine />
        </div>

        <div className="pcd-tabs" role="tablist">
          {LAYERS.map((l) => (
            <button
              key={l.key}
              type="button"
              role="tab"
              aria-selected={layer === l.key}
              className={layer === l.key ? "is-on" : ""}
              onClick={() => setLayer(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <main className="pcd-main" style={{ marginTop: 16 }}>
          {layer === "traffic" ? <TrafficSection /> : null}
          {layer === "adoption" ? <AdoptionSection /> : null}
          {layer === "workflow" ? <WorkflowSection /> : null}
        </main>
      </div>

      <small className="pcd-muted" style={{ display: "block", padding: "0 22px 24px" }}>
        Data from <code>posthog-api.lockated.com/fm/adoption/*</code> for tenant{" "}
        <code>{ANALYTICS_TENANT}</code>. Each call is a server-side scan; numbers refresh
        on demand.
      </small>
    </div>
  );
};

/* dscope reads the current filters; wrapped in a tiny component so it re-renders. */
function ScopeLine() {
  const d = useDashboard();
  return (
    <span>
      <b>{d.scopeLabel}</b> · <b>{d.dateLabel}</b>
    </span>
  );
}

const PosthogDashboardPage = () => (
  <DashboardProvider>
    <DashboardBody />
  </DashboardProvider>
);

export default PosthogDashboardPage;
