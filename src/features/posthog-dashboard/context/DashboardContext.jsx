import { createContext, useContext, useMemo, useState } from "react";
import {
  TREND_WEEKS,
  GROWTH_WEEKS,
  RETENTION_WEEKS,
  DEVICE_TYPES,
  rangeForDays,
  isoDate,
  DEFAULT_WINDOW,
} from "../data/constants";

/* ---------------------------------------------------------------------------
 * DashboardProvider — owns the filter controls state (date window, sites,
 * device type, licensed seats, module/sub-module selection) and exposes them
 * to the section components so they can build their per-query parameters.
 *
 * The provider does NOT itself fetch analytics; it only keeps the shared
 * filter state that the query hooks consume. Sections call the hooks with the
 * derived parameters they need.
 * ------------------------------------------------------------------------- */

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [dateWindow, setDateWindow] = useState(DEFAULT_WINDOW);
  const [siteIds, setSiteIds] = useState([]);
  const [device, setDevice] = useState("All"); // 'All' | 'Desktop' | 'Mobile'
  const [licensedSeats, setLicensedSeats] = useState("");
  const [module, setModule] = useState("");      // '' = top-level tree / default workflow
  const [subModule, setSubModule] = useState("");

  const range = useMemo(() => rangeForDays(dateWindow), [dateWindow]);

  /* "settled" means the filters are fully formed — effectively always true here
     since we have no async site bootstrapping; the date range is computed
     synchronously. Kept in the API for gate-able callers. */
  const settled = useMemo(() => Boolean(range.from && range.to), [range.from, range.to]);

  /* Shared filter fragments passed to the query hooks. */
  const rangeFilters = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      siteIds: siteIds.length ? siteIds : undefined,
      devices: device === "All" ? undefined : [device],
    }),
    [range.from, range.to, siteIds, device]
  );

  const weeklyFilters = useMemo(
    () => ({
      to: range.to,
      weeks: TREND_WEEKS,
      siteIds: siteIds.length ? siteIds : undefined,
      devices: device === "All" ? undefined : [device],
    }),
    [range.to, siteIds, device]
  );

  const engagementFilters = useMemo(
    () => ({
      ...rangeFilters,
      licensedSeats: licensedSeats && Number(licensedSeats) > 0 ? Number(licensedSeats) : undefined,
    }),
    [rangeFilters, licensedSeats]
  );

  const growthFilters = useMemo(
    () => ({ ...weeklyFilters, weeks: GROWTH_WEEKS }),
    [weeklyFilters]
  );

  const retentionFilters = useMemo(
    () => ({ ...weeklyFilters, weeks: RETENTION_WEEKS }),
    [weeklyFilters]
  );

  const workflowFilters = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      siteIds: siteIds.length ? siteIds : undefined,
      devices: device === "All" ? undefined : [device],
      module: module || undefined,
      subModule: subModule || undefined,
    }),
    [range.from, range.to, siteIds, device, module, subModule]
  );

  const value = useMemo(
    () => ({
      // state
      dateWindow,
      setDateWindow,
      siteIds,
      setSiteIds,
      device,
      setDevice,
      licensedSeats,
      setLicensedSeats,
      module,
      setModule,
      subModule,
      setSubModule,
      deviceOptions: DEVICE_TYPES,
      settled,
      range,
      // derived filters
      rangeFilters,
      weeklyFilters,
      engagementFilters,
      growthFilters,
      retentionFilters,
      workflowFilters,
      // helpers
      scopeLabel: siteIds.length ? `${siteIds.length} site(s)` : "All sites",
      dateLabel: `${range.from} → ${range.to}`,
    }),
    [
      dateWindow,
      siteIds,
      device,
      licensedSeats,
      module,
      subModule,
      settled,
      range,
      rangeFilters,
      weeklyFilters,
      engagementFilters,
      growthFilters,
      retentionFilters,
      workflowFilters,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within <DashboardProvider>");
  return ctx;
};

/* Small helper to keep weekly labels consistent. */
export { isoDate };
