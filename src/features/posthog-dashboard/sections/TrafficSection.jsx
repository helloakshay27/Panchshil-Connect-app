import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { StatTile, MetricCard } from "../../../components/dashboard/DashboardCharts";
import { useDashboard } from "../context/DashboardContext";
import {
  useTrafficSession,
  useUsageAndDistribution,
  useRefreshAnalytics,
  CONTINUOUS_QUERY_KEY,
} from "../api/queries";
import { fetchTrafficSession } from "../api/adoptionApi";
import { buildTraffic, buildUsage, formatDuration } from "../data/metrics";
import { QueryCard } from "../components/Status";

const nf = new Intl.NumberFormat("en-IN");

/* Per-site fan-out — there is no per-site endpoint, so fan traffic_session out
   once per allowed site. Rows render as each call lands. */
const useSiteTraffic = (siteIds, rangeFilters) => {
  const queries = useQueries({
    queries: siteIds.map((siteId) => ({
      queryKey: [CONTINUOUS_QUERY_KEY, "traffic_session", "site", siteId, rangeFilters],
      queryFn: () => fetchTrafficSession({ ...rangeFilters, siteIds: [siteId] }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: Boolean(rangeFilters.to),
    })),
  });
  const byId = useMemo(
    () => Object.fromEntries(siteIds.map((id, i) => [id, queries[i]])),
    [siteIds, queries]
  );
  return { byId, list: queries };
};

const SiteLeaderboard = ({ onRetry }) => {
  const dashboard = useDashboard();
  const rangeFilters = dashboard.rangeFilters;
  const siteIds = dashboard.siteIds;

  const { byId, list } = useSiteTraffic(siteIds, rangeFilters);

  const rows = useMemo(
    () =>
      siteIds
        .map((siteId) => {
          const q = byId[siteId];
          if (!q?.data) return null;
          const t = q.data.tiles;
          return {
            siteId,
            activeUsers: t?.active_users ?? 0,
            sessions: t?.sessions ?? 0,
            avgSession: t?.avg_session_seconds ? formatDuration(t.avg_session_seconds) : "—",
            bounce: t?.bounce_rate != null ? `${Math.round(t.bounce_rate)}%` : "—",
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.activeUsers - a.activeUsers || b.sessions - a.sessions),
    [siteIds, byId]
  );

  if (siteIds.length < 2) return null;

  const loading = list.some((q) => q.isLoading);
  const anyError = list.some((q) => q.isError);

  return (
    <div className="pcd-grid">
      <div className="pcd-span-4">
        <QueryCard
          title="Site-Wise Breakdown"
          subtitle="Active users, sessions, duration and bounce per site"
          query={{ isLoading: loading, isError: anyError, isFetching: loading }}
          empty={!rows.length}
          onRetry={onRetry}
        >
          <div className="pcd-table-scroll">
            <table className="pcd-table">
              <thead>
                <tr>
                  <th>Site ID</th>
                  <th>Active users</th>
                  <th>Sessions</th>
                  <th>Avg session</th>
                  <th>Bounce</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.siteId}>
                    <td>{r.siteId}</td>
                    <td>{nf.format(r.activeUsers)}</td>
                    <td>{nf.format(r.sessions)}</td>
                    <td>{r.avgSession}</td>
                    <td>{r.bounce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </QueryCard>
      </div>
    </div>
  );
};

const TrafficSection = ({ onRetry }) => {
  const dashboard = useDashboard();
  const rangeFilters = dashboard.rangeFilters;
  const siteIds = dashboard.siteIds;

  const traffic = useTrafficSession(rangeFilters, { enabled: Boolean(rangeFilters.to) });
  const usage = useUsageAndDistribution(rangeFilters, { enabled: Boolean(rangeFilters.to) });
  const refresh = useRefreshAnalytics();

  const builtTraffic = useMemo(() => buildTraffic(traffic.data || {}), [traffic.data]);
  const builtUsage = useMemo(() => buildUsage(usage.data || {}), [usage.data]);
  const retry = onRetry || refresh;

  const tiles = useMemo(() => {
    const hero = builtTraffic.tiles;
    return [
      ...hero.map((t) => ({
        label: t.label,
        value: t.display,
        sub: t.caption,
      })),
      {
        label: "Recently Online",
        value: nf.format(builtTraffic.recentlyOnline),
        sub: "Active in last 30 min",
      },
    ];
  }, [builtTraffic]);

  return (
    <>
      <div className="pcd-tiles">
        {tiles.map((t) => (
          <StatTile key={t.label} label={t.label} value={t.value} sub={t.sub} loading={traffic.isLoading} />
        ))}
      </div>

      <div className="pcd-grid">
        <div className="pcd-span-2">
          <QueryCard
            title="Usage Over Time"
            subtitle="Visitors · Views · Sessions"
            query={usage}
            empty={!builtUsage.daily.length}
            onRetry={retry}
          >
            <div className="pcd-table-scroll">
              <table className="pcd-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Visitors</th>
                    <th>Views</th>
                    <th>Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {builtUsage.daily.map((d) => (
                    <tr key={d.day}>
                      <td>{d.day}</td>
                      <td>{nf.format(d.current.visitors)}</td>
                      <td>{nf.format(d.current.views)}</td>
                      <td>{nf.format(d.current.sessions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </QueryCard>
        </div>

        <div className="pcd-span-2">
          <QueryCard
            title="Device Split"
            subtitle="Session share by device"
            query={usage}
            empty={!builtUsage.devices.length}
            onRetry={retry}
          >
            <div className="pcd-table-scroll">
              <table className="pcd-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Users</th>
                    <th>Sessions</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {builtUsage.devices.map((d) => (
                    <tr key={d.label}>
                      <td>{d.label}</td>
                      <td>{nf.format(d.users)}</td>
                      <td>{nf.format(d.value)}</td>
                      <td>{d.share != null ? `${Math.round(d.share)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </QueryCard>
        </div>

        <div className="pcd-span-4">
          <MetricCard
            label="Views per Session"
            value={builtUsage.viewsPerSession}
            caption={builtUsage.daily.length ? `Average across ${builtUsage.daily.length} days` : null}
            loading={usage.isLoading}
          />
        </div>
      </div>

      <SiteLeaderboard onRetry={retry} />

      <small className="pcd-muted">Scoped to {siteIds.length ? `${siteIds.length} site(s)` : "all sites"}</small>
    </>
  );
};

export default TrafficSection;
