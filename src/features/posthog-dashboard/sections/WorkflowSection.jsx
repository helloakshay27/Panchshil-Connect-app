import { useMemo, useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import {
  useModuleTree,
  useSubModuleTree,
  useWorkflowUsage,
  useRefreshAnalytics,
} from "../api/queries";
import { buildModuleTree, buildFlows } from "../data/metrics";
import { QueryCard } from "../components/Status";
import { MetricCard } from "../../../components/dashboard/DashboardCharts";

const nf = new Intl.NumberFormat("en-IN");
const pct = (v) => (v == null ? "—" : `${Math.round(v)}%`);

const WorkflowSection = ({ onRetry }) => {
  const dashboard = useDashboard();
  const { rangeFilters, workflowFilters, subModule, setSubModule } = dashboard;

  const [selectedModule, setSelectedModuleLocal] = useState("");

  const moduleTree = useModuleTree(rangeFilters, { enabled: Boolean(rangeFilters.to) });
  const subTree = useSubModuleTree(selectedModule || undefined, rangeFilters, {
    enabled: Boolean(rangeFilters.to) && Boolean(selectedModule),
  });
  const workflow = useWorkflowUsage(
    {
      ...workflowFilters,
      module: selectedModule || undefined,
      subModule: subModule || undefined,
    },
    { enabled: Boolean(workflowFilters.to) }
  );
  const refresh = useRefreshAnalytics();
  const retry = onRetry || refresh;

  const modules = useMemo(() => buildModuleTree(moduleTree.data || {}).modules, [moduleTree.data]);
  const subModules = useMemo(() => buildModuleTree(subTree.data || {}).modules, [subTree.data]);
  const flows = useMemo(() => buildFlows(workflow.data || {}), [workflow.data]);

  const kpiTiles = [
    flows.kpis.fAdopt,
    flows.kpis.fComp,
    flows.kpis.fStep,
    flows.kpis.fVol,
  ];

  return (
    <>
      {/* module nav — derived from the API's $pathname tree, not hardcoded */}
      <div className="pud-modnav">
        <div className="pud-modnav-buckets">
          <button
            type="button"
            className={!selectedModule ? "is-on" : ""}
            onClick={() => {
              setSelectedModuleLocal("");
              setSubModule("");
            }}
          >
            All Modules
          </button>
        </div>
        <div className="pud-modnav-mods">
          {modules.map((m) => (
            <button
              key={m.name}
              type="button"
              className={selectedModule === m.name ? "is-on" : ""}
              onClick={() => {
                setSelectedModuleLocal(m.name);
                setSubModule("");
              }}
            >
              {m.name}
              <span className="pud-mcount">{m.users}</span>
            </button>
          ))}
        </div>
        {selectedModule && subModules.length ? (
          <div className="pud-modnav-mods" style={{ marginTop: 8 }}>
            {subModules.map((sm) => (
              <button
                key={sm.name}
                type="button"
                className={subModule === sm.name ? "is-on" : ""}
                onClick={() => setSubModule(sm.name)}
              >
                {sm.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pcd-tiles">
        {kpiTiles.map((k) => (
          <MetricCard
            key={k.label}
            label={k.label}
            value={k.raw}
            caption={k.delta != null ? `${Math.round(k.delta)}% vs prior` : null}
            loading={workflow.isLoading}
          />
        ))}
      </div>

      <div className="pcd-grid" style={{ marginTop: 14 }}>
        <div className="pcd-span-4">
          <QueryCard
            title="Workflow Funnel"
            subtitle={selectedModule ? `${selectedModule}${subModule ? ` / ${subModule}` : ""} workflow` : "Default maintenance / ticket workflow"}
            query={workflow}
            empty={!flows.funnel.length}
            onRetry={retry}
          >
            <div className="pud-funnel">
              {flows.funnel.map((s, i) => (
                <div key={s.step}>
                  {i > 0 ? (
                    <div className="pud-funnel-drop">▼ {s.drop_pct == null ? "—" : `${Math.round(s.drop_pct)}%`} drop-off</div>
                  ) : null}
                  <div
                    className="pud-funnel-step"
                    style={{
                      width: `${45 + (s.reach / (flows.funnel[0]?.reach || 1)) * 55}%`,
                      opacity: 1 - i * 0.08,
                    }}
                  >
                    {s.step}
                    <span className="pud-funnel-sub">
                      {nf.format(s.reach)} of entrants
                      {s.isBiggest ? " · biggest drop" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </QueryCard>
        </div>

        <div className="pcd-span-4">
          <QueryCard title="All Screens in Workflow" subtitle="Users, events and sessions per path" query={workflow} empty={!flows.flows.length} onRetry={retry}>
            <div className="pcd-table-scroll">
              <table className="pcd-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Users</th>
                    <th>Events</th>
                    <th>Sessions</th>
                    <th>F-comp</th>
                    <th>F-step</th>
                    <th>F-vol</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.flows.slice(0, 20).map((f) => (
                    <tr key={f.path}>
                      <td style={{ whiteSpace: "normal" }}>{f.path}</td>
                      <td>{nf.format(f.users)}</td>
                      <td>{nf.format(f.events)}</td>
                      <td>{nf.format(f.sessions)}</td>
                      <td>{pct(f.fComp)}</td>
                      <td>{pct(f.fStep)}</td>
                      <td>{pct(f.fVol)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </QueryCard>
        </div>

        <div className="pcd-span-4">
          <QueryCard title="Top Entry Screens" subtitle="First screen seen in a session" query={workflow} empty={!flows.entryScreens.length} onRetry={retry}>
            <div className="pcd-table-scroll">
              <table className="pcd-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Visitors</th>
                    <th>Views</th>
                    <th>Bounce</th>
                    <th>Visitors trend</th>
                    <th>Views trend</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.entryScreens.map((e) => (
                    <tr key={e.path}>
                      <td style={{ whiteSpace: "normal" }}>{e.path}</td>
                      <td>{nf.format(e.visitors)}</td>
                      <td>{nf.format(e.views)}</td>
                      <td>{pct(e.bounce)}</td>
                      <td>{e.visitorsTrend != null ? `${Math.round(e.visitorsTrend)}%` : "—"}</td>
                      <td>{e.viewsTrend != null ? `${Math.round(e.viewsTrend)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </QueryCard>
        </div>
      </div>
    </>
  );
};

export default WorkflowSection;
