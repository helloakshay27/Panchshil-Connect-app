import { useMemo } from "react";
import { AreaChart, HBar, MetricCard, StackedShareBar, VIZ } from "../../../components/dashboard/DashboardCharts";
import { useDashboard } from "../context/DashboardContext";
import {
  useAdoptionEngagement,
  useAdoptionTrend,
  useGrowth,
  useRetention,
  useRoles,
  useRefreshAnalytics,
} from "../api/queries";
import { buildAdopt, buildAdoptionTrend, buildGrowth, buildRetention, buildRoles, formatRole } from "../data/metrics";
import { QueryCard } from "../components/Status";

const pfmt = (v, unit = "") => (v == null ? "—" : `${Math.round(v)}${unit}`);
const cohortColor = (v) => {
  const i = Math.min(VIZ.ramp.length - 1, Math.max(1, Math.ceil((v / 100) * (VIZ.ramp.length - 1))));
  return VIZ.ramp[i];
};

const AdoptionSection = ({ onRetry }) => {
  const dashboard = useDashboard();
  const { engagementFilters, weeklyFilters, growthFilters, retentionFilters, rangeFilters } = dashboard;

  const engagement = useAdoptionEngagement(engagementFilters, { enabled: Boolean(engagementFilters.to) });
  const trend = useAdoptionTrend(weeklyFilters, { enabled: Boolean(weeklyFilters.to) });
  const growth = useGrowth(growthFilters, { enabled: Boolean(growthFilters.to) });
  const retention = useRetention(retentionFilters, { enabled: Boolean(retentionFilters.to) });
  const roles = useRoles(rangeFilters, { enabled: Boolean(rangeFilters.to) });
  const refresh = useRefreshAnalytics();
  const retry = onRetry || refresh;

  const adopt = useMemo(() => buildAdopt(engagement.data || {}), [engagement.data]);
  const trendB = useMemo(() => buildAdoptionTrend(trend.data || {}), [trend.data]);
  const growthB = useMemo(() => buildGrowth(growth.data || {}), [growth.data]);
  const retentionB = useMemo(() => buildRetention(retention.data || {}), [retention.data]);
  const rolesB = useMemo(() => buildRoles(roles.data || {}), [roles.data]);

  const trendPoints = trendB.current.length ? trendB.current : null;

  return (
    <>
      <div className="pcd-tiles">
        <MetricCard label={adopt.seat.label} value={adopt.seat.raw} caption={adopt.seat.sub || null} loading={engagement.isLoading} />
        <MetricCard label={adopt.stickiness.label} value={adopt.stickiness.raw} caption={adopt.stickiness.sub || null} loading={engagement.isLoading} />
        <MetricCard label={adopt.adoptionTrend.label} value={adopt.adoptionTrend.raw} caption={adopt.adoptionTrend.sub || null} loading={engagement.isLoading} />
        <MetricCard label={adopt.activation.label} value={adopt.activation.raw} caption={adopt.activation.sub || null} loading={engagement.isLoading} />
        <MetricCard label={adopt.moduleBreadth.label} value={adopt.moduleBreadth.inUse} caption={`of ${adopt.moduleBreadth.total} modules used`} loading={engagement.isLoading} />
        <MetricCard label={adopt.dormant.label} value={adopt.dormant.value} caption={adopt.dormant.band || null} loading={engagement.isLoading} />
      </div>

      <div className="pcd-grid" style={{ marginTop: 14 }}>
        <div className="pcd-span-2">
          <QueryCard
            title="Adoption Trend"
            subtitle="Weekly active users, current vs prior"
            query={trend}
            empty={!trendPoints}
            onRetry={retry}
          >
            <AreaChart points={trendPoints.map((p) => ({ label: p.label, count: p.wau }))} />
          </QueryCard>
        </div>

        <div className="pcd-span-2">
          <QueryCard title="Growth Accounting" subtitle="New · Returning · Resurrected · Dormant" query={growth} empty={!growthB.share.some((s) => s.value)} onRetry={retry}>
            <StackedShareBar rows={growthB.share} />
          </QueryCard>
        </div>

        <div className="pcd-span-2">
          <QueryCard title="Retention · Weekly Cohorts" subtitle="% of each cohort still active N weeks later" query={retention} empty={!retentionB.cohorts.length} onRetry={retry}>
            <div className="pcd-table-scroll">
              <table className="pud-cohort">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Cohort</th>
                    <th>Size</th>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((w) => (
                      <th key={w}>W{w}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retentionB.cohorts.slice(0, 8).map((row) => (
                    <tr key={row.cohort_week}>
                      <td className="pud-cohort-label">{row.cohort_week}</td>
                      <td className="pud-cohort-label">{row.size}</td>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((w) => {
                        const v = row[`week${w}`];
                        if (v == null) return <td key={w} className="pud-cohort-empty">·</td>;
                        return (
                          <td key={w} style={{ background: cohortColor(v), color: v >= 55 ? "#fff" : "#1f2933" }}>
                            {v}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </QueryCard>
        </div>

        <div className="pcd-span-2">
          <QueryCard title="Adoption by Role" subtitle="Users, events and active share" query={roles} empty={!rolesB.roles.length} onRetry={retry}>
            <HBar rows={rolesB.roles.map((r) => ({ label: formatRole(r.role), value: r.users }))} />
            <div className="pcd-muted" style={{ marginTop: 8, fontSize: 12 }}>
              Last week active share:{" "}
              {rolesB.roles
                .map((r) => `${formatRole(r.role)} ${pfmt(r.activeShare, "%")}`)
                .join(" · ") || "—"}
            </div>
          </QueryCard>
        </div>
      </div>
    </>
  );
};

export default AdoptionSection;
