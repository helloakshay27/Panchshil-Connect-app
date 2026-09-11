import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  AreaChart as RechartsAreaChart,
  Area,
  Line,
} from "recharts";
import { InfoButton } from "../../pages/usage-info-popover";

/**
 * Visualization tokens for the Panchshil Connect dashboard.
 *
 * Slot 1 is the existing Panchshil orange (--red in mor.css). Slot 2 is the
 * Panchshil dark red (#8B0203) stepped up into the legal lightness band - the
 * original is too dark to read as a chart mark. Slot 3 is a cool hue to balance
 * the warm pair.
 *
 * The three slots were validated all-pairs for colour-vision deficiency:
 * worst pair dE 19.0 (deuteranopia), 20.3 (normal vision).
 * Assign in fixed order, never cycled.
 */
export const VIZ = {
  brand: "#de7008",
  brand2: "#A81E20",
  brand3: "#0E7FA8",
  cat: ["#de7008", "#A81E20", "#0E7FA8"],
  // sequential ramp, single hue, monotone light -> dark (verified)
  ramp: ["#fdf1e4", "#fbdcbc", "#f6bd85", "#ee9a4d", "#de7008", "#b25a06", "#8a4605"],
  rampEmpty: "#f4f4f5",
  ink: "#1f2933",
  inkMuted: "#667085",
  grid: "#e9e7e5",
};

const nf = new Intl.NumberFormat("en-IN");
const pct = (v, total) => (total > 0 ? Math.round((v / total) * 100) : 0);

/* Shared Recharts tooltips - small cards matching the dashboard's own
   visual language (white surface, hairline border, soft shadow) instead
   of Recharts' bare default box. Reused across every Recharts-based
   chart below. */
const SimpleTooltip = ({ active, payload, suffix = "" }) => {
  if (!active || !payload || !payload.length) return null;
  const title = payload[0].payload?.name ?? payload[0].payload?.label;
  return (
    <div className="pcd-rechart-tooltip">
      {title != null ? <div className="pcd-rechart-tooltip-title">{title}</div> : null}
      {payload.map((p) => (
        <div key={p.dataKey} className="pcd-rechart-tooltip-row">
          <span className="pcd-rechart-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="pcd-rechart-tooltip-name">{p.name || p.dataKey}</span>
          <span className="pcd-rechart-tooltip-value">
            {nf.format(p.value)}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
};

const ShareTooltip = ({ active, payload, total }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="pcd-rechart-tooltip">
      {payload.map((p) => (
        <div key={p.dataKey} className="pcd-rechart-tooltip-row">
          <span className="pcd-rechart-tooltip-dot" style={{ background: p.color }} />
          <span className="pcd-rechart-tooltip-name">{p.dataKey}</span>
          <span className="pcd-rechart-tooltip-value">
            {nf.format(p.value)} · {pct(p.value, total)}%
          </span>
        </div>
      ))}
    </div>
  );
};

/* Small "i" info button - shown on any tile/card that has caption text to
   surface, using that same text as a native hover tooltip. Purely additive
   (no-op when there's nothing to show), matching the reference wireframe's
   info-icon-on-every-card convention. */
const InfoIcon = ({ text }) =>
  text ? (
    <span className="pcd-info-btn" title={text} aria-label={text}>
      i
    </span>
  ) : null;

/* ================================================================== */
/* Stat tile - a hero number. The number IS the chart.                */
/* ================================================================== */
export const StatTile = ({ label, value, sub, loading }) => (
  <div className="pcd-tile">
    <div className="pcd-tile-tophead">
      <div className="pcd-tile-label">{label}</div>
      <InfoIcon text={sub} />
    </div>
    <div className="pcd-tile-value">
      {loading ? <span className="pcd-skel pcd-skel-num" /> : nf.format(value ?? 0)}
    </div>
    {sub ? <div className="pcd-tile-sub">{sub}</div> : null}
  </div>
);

/* ================================================================== */
/* Card shell                                                          */
/* ================================================================== */
export const ChartCard = ({ eyebrow, title, subtitle, legend, loading, error, empty, infoKey, onInfo, children }) => (
  <div className="pcd-card">
    <div className="pcd-card-head">
      <div>
        {eyebrow ? <div className="pcd-card-eyebrow">{eyebrow}</div> : null}
        <h3 className="pcd-card-title">{title}</h3>
        {subtitle ? <p className="pcd-card-sub">{subtitle}</p> : null}
      </div>
      <div className="pcd-card-head-right">
        {legend && !loading && !error && !empty ? (
          <ul className="pcd-legend">
            {legend.map((l) => (
              <li key={l.label}>
                <span className="pcd-legend-dot" style={{ background: l.color }} />
                {l.label}
              </li>
            ))}
          </ul>
        ) : null}
        {infoKey ? <InfoButton infoKey={infoKey} onInfo={onInfo} /> : <InfoIcon text={subtitle} />}
      </div>
    </div>

    <div className="pcd-card-body">
      {loading ? (
        <div className="pcd-state">
          <span className="pcd-skel pcd-skel-row" />
          <span className="pcd-skel pcd-skel-row" />
          <span className="pcd-skel pcd-skel-row" />
        </div>
      ) : error ? (
        <div className="pcd-state pcd-state-error">{error}</div>
      ) : empty ? (
        <div className="pcd-state pcd-state-empty">No data for the selected filters</div>
      ) : (
        children
      )}
    </div>
  </div>
);

/* ================================================================== */
/* BAR (horizontal) - magnitude across nominal categories with long   */
/* names. One hue: bar length already encodes the value, so colour    */
/* stays free. Built with Recharts (BarChart, layout="vertical").     */
/* ================================================================== */
export const HBar = ({ rows, valueSuffix = "", color = VIZ.brand }) => {
  const chartData = rows.map((r) => ({ name: r.label, value: r.value }));
  const height = Math.max(rows.length * 34 + 16, 90);

  return (
    <div className="pcd-rechart-inner" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={VIZ.grid} />
          <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
          <Tooltip content={<SimpleTooltip suffix={valueSuffix} />} cursor={{ fill: "rgba(31, 41, 51, 0.05)" }} />
          <Bar dataKey="value" name="Value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ================================================================== */
/* COLUMN (vertical bar) - short labels, few categories. Built with    */
/* Recharts (BarChart, default layout).                                */
/* ================================================================== */
export const ColumnChart = ({ rows, height = 220 }) => {
  const chartData = rows.map((r) => ({ name: r.label, value: r.value }));
  // Long/many category names collide if drawn flat, so once there's more
  // than a handful they're angled ("crossed") like a normal bar-chart axis,
  // with extra bottom margin/axis height to fit the diagonal text.
  const angled = chartData.length > 4;

  return (
    <div className="pcd-rechart-inner" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: angled ? 28 : 0 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={VIZ.grid} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={angled ? -35 : 0}
            textAnchor={angled ? "end" : "middle"}
            height={angled ? 56 : 30}
          />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip content={<SimpleTooltip />} cursor={{ fill: "rgba(31, 41, 51, 0.05)" }} />
          <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={VIZ.cat[i % VIZ.cat.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* Custom tooltip - a small card matching the dashboard's own visual
   language (white surface, hairline border, soft shadow) instead of
   Recharts' bare default box, with a computed Total row beneath the
   per-segment breakdown. */
const StackedColumnTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
  return (
    <div className="pcd-rechart-tooltip">
      <div className="pcd-rechart-tooltip-title">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="pcd-rechart-tooltip-row">
          <span className="pcd-rechart-tooltip-dot" style={{ background: p.color }} />
          <span className="pcd-rechart-tooltip-name">{p.name}</span>
          <span className="pcd-rechart-tooltip-value">{nf.format(p.value)}</span>
        </div>
      ))}
      <div className="pcd-rechart-tooltip-row pcd-rechart-tooltip-total">
        <span className="pcd-rechart-tooltip-name">Total</span>
        <span className="pcd-rechart-tooltip-value">{nf.format(total)}</span>
      </div>
    </div>
  );
};

/* ================================================================== */
/* STACKED COLUMN - one column per category, split into two stacked   */
/* segments (active vs. the remainder of a total). Built with Recharts,*/
/* the same charting library and stacked-Bar pattern the Pulse         */
/* dashboard uses for its "Community Member Status Breakdown" chart    */
/* (PulseCommunity.tsx) - CartesianGrid + XAxis/YAxis + stacked Bars,   */
/* legend top-right, rounded cap on the topmost segment.               */
/* ================================================================== */
export const StackedColumnChart = ({ rows, colorActive = VIZ.brand2, colorRemaining = VIZ.brand }) => {
  const chartData = rows.map((r) => ({
    name: r.label,
    Active: r.b,
    Inactive: Math.max(r.a - r.b, 0),
  }));

  return (
    <div className="pcd-rechart-inner">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={VIZ.grid} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            content={<StackedColumnTooltip />}
            cursor={{ fill: "rgba(31, 41, 51, 0.05)" }}
          />
          <Legend align="right" wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Active" stackId="services" fill={colorActive} />
          <Bar dataKey="Inactive" stackId="services" fill={colorRemaining} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ================================================================== */
/* GROUPED BAR - two distinct series, legend mandatory                */
/* ================================================================== */
export const GroupedHBar = ({ rows }) => {
  const peak = Math.max(...rows.flatMap((r) => [r.a, r.b]), 0);
  const w = (v) => `${peak > 0 ? Math.max((v / peak) * 100, v > 0 ? 1.5 : 0) : 0}%`;
  return (
    <ul className="pcd-hbar pcd-hbar-grouped">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="pcd-hbar-label" title={r.label}>
            {r.label}
          </span>
          <span className="pcd-hbar-stack">
            <span className="pcd-hbar-track">
              <span className="pcd-hbar-fill" style={{ width: w(r.a), background: VIZ.brand }} />
            </span>
            <span className="pcd-hbar-track">
              <span className="pcd-hbar-fill" style={{ width: w(r.b), background: VIZ.brand2 }} />
            </span>
          </span>
          <span className="pcd-hbar-value pcd-hbar-value-dual">
            <em>{nf.format(r.a)}</em>
            <em>{nf.format(r.b)}</em>
          </span>
        </li>
      ))}
    </ul>
  );
};

/* ================================================================== */
/* STACKED BAR (part-to-whole) - the right form for 2 segments.       */
/* A 2-slice pie is an anti-pattern; this reads the share directly.   */
/* Built with Recharts: one category row, one <Bar> per segment,      */
/* all sharing the same stackId so they lay end-to-end as one 100%    */
/* bar. ------------------------------------------------------------- */
/* ================================================================== */
export const StackedShareBar = ({ rows, colors = VIZ.cat }) => {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const chartData = [rows.reduce((acc, r) => ({ ...acc, [r.label]: r.value }), { name: "share" })];

  return (
    <div className="pcd-share">
      <div className="pcd-rechart-inner" style={{ height: 56 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, total || 1]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<ShareTooltip total={total} />} cursor={false} />
            {rows.map((r, i) => (
              <Bar
                key={r.label}
                dataKey={r.label}
                stackId="share"
                fill={colors[i % colors.length]}
                barSize={26}
                radius={
                  rows.length === 1
                    ? [4, 4, 4, 4]
                    : i === 0
                      ? [4, 0, 0, 4]
                      : i === rows.length - 1
                        ? [0, 4, 4, 0]
                        : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="pcd-share-keys">
        {rows.map((r, i) => (
          <li key={r.label}>
            <span className="pcd-legend-dot" style={{ background: colors[i % colors.length] }} />
            <span className="pcd-share-name" title={r.label}>
              {r.label}
            </span>
            <strong>{nf.format(r.value)}</strong>
            <em>{pct(r.value, total)}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ================================================================== */
/* DONUT - part-to-whole at a glance, legal at 3..6 segments. Built    */
/* with Recharts (PieChart + Pie with an innerRadius), with the total  */
/* (or the hovered segment) overlaid in the center via an absolutely-  */
/* positioned div, since Recharts has no built-in center label.       */
/* ================================================================== */
export const DonutChart = ({ rows, centerLabel = "Total", colors = VIZ.cat }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = rows.reduce((s, r) => s + r.value, 0);
  const focus = hoverIdx != null ? rows[hoverIdx] : null;

  return (
    <div className="pcd-donut-wrap">
      <div className="pcd-rechart-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="94%"
              paddingAngle={rows.length > 1 ? 3 : 0}
              cornerRadius={3}
              stroke="none"
              onMouseEnter={(_, i) => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {rows.map((r, i) => (
                <Cell key={r.label} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pcd-donut-center">
          <div className="pcd-donut-center-value">{nf.format(focus ? focus.value : total)}</div>
          <div className="pcd-donut-center-label">{focus ? `${pct(focus.value, total)}%` : centerLabel}</div>
        </div>
      </div>

      <ul className="pcd-donut-keys">
        {rows.map((r, i) => (
          <li
            key={r.label}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            className={hoverIdx === i ? "is-on" : ""}
          >
            <span className="pcd-legend-dot" style={{ background: colors[i % colors.length] }} />
            <span className="pcd-share-name" title={r.label}>
              {r.label}
            </span>
            <strong>{nf.format(r.value)}</strong>
            <em>{pct(r.value, total)}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ================================================================== */
/* AREA / LINE - hour of day is an ordered continuous axis, so a      */
/* line is the correct form for the distribution across it. Built     */
/* with Recharts (AreaChart + Area, with an optional dashed Line for  */
/* the previous-period comparison series).                            */
/* ================================================================== */
export const AreaChart = ({ points, previousPoints, color = VIZ.brand, height = 210 }) => {
  const hasPrev = Array.isArray(previousPoints) && previousPoints.length === points.length;
  const gradientId = `pcd-fill-${color.replace("#", "")}`;
  const chartData = points.map((p, i) => ({
    label: p.label,
    count: p.count,
    previous: hasPrev ? previousPoints[i].count : undefined,
  }));
  // Thin out x-axis ticks on long series so labels don't collide - every
  // point is still plotted, only the tick text is skipped.
  const tickInterval = Math.max(Math.ceil(points.length / 8) - 1, 0);

  return (
    <div className="pcd-rechart-inner" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.26} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={VIZ.grid} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval={tickInterval}
            tickFormatter={(v) => String(v).replace(/^0/, "")}
          />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
          <Tooltip content={<SimpleTooltip />} />
          {hasPrev ? (
            <Line
              type="monotone"
              dataKey="previous"
              name="Previous"
              stroke="#c2c0bd"
              strokeWidth={1.6}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="count"
            name="Value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, strokeWidth: 0, fill: color }}
            activeDot={{ r: 5 }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ================================================================== */
/* HEAT MAP - a grid of magnitudes: projects x hour of day            */
/* ================================================================== */
export const HeatMap = ({ rows, hourLabels }) => {
  const [hover, setHover] = useState(null);
  const peak = Math.max(...rows.flatMap((r) => r.hours.map((h) => h.count)), 0);

  const shade = (count) => {
    if (!count || peak <= 0) return VIZ.rampEmpty;
    const i = Math.min(
      VIZ.ramp.length - 1,
      Math.max(1, Math.ceil((count / peak) * (VIZ.ramp.length - 1)))
    );
    return VIZ.ramp[i];
  };

  return (
    <div className="pcd-heat-wrap">
      <div className="pcd-heat" style={{ "--pcd-cols": hourLabels.length }}>
        <div className="pcd-heat-corner" />
        {hourLabels.map((h, i) => (
          <div key={h.hour} className="pcd-heat-colhead">
            {i % 3 === 0 ? h.label.replace(/^0/, "") : ""}
          </div>
        ))}

        {rows.map((r) => (
          <React.Fragment key={r.project_id}>
            <div className="pcd-heat-rowhead" title={r.project_name}>
              {r.project_name}
            </div>
            {r.hours.map((h) => (
              <div
                key={h.hour}
                className="pcd-heat-cell"
                style={{ background: shade(h.count) }}
                onMouseEnter={() =>
                  setHover({ project: r.project_name, label: h.label, count: h.count })
                }
                onMouseLeave={() => setHover(null)}
                tabIndex={h.count ? 0 : -1}
                onFocus={() =>
                  setHover({ project: r.project_name, label: h.label, count: h.count })
                }
                onBlur={() => setHover(null)}
              >
                <span className="pcd-sr">{`${r.project_name} ${h.label}: ${h.count}`}</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="pcd-heat-foot">
        <div className="pcd-hint">
          {hover ? (
            <>
              <strong>{hover.project}</strong> · {hover.label} · {nf.format(hover.count)}
            </>
          ) : (
            <span className="pcd-muted">Hover a cell for details</span>
          )}
        </div>
        <div className="pcd-heat-scale">
          <span className="pcd-muted">0</span>
          {VIZ.ramp.slice(1).map((c) => (
            <span key={c} className="pcd-heat-swatch" style={{ background: c }} />
          ))}
          <span className="pcd-muted">{nf.format(peak)}</span>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* KPI ribbon - the headline band across the top                      */
/* ================================================================== */
export const KpiRibbon = ({ items, loading }) => (
  <div className="pcd-ribbon">
    {items.map((it) => (
      <div key={it.label} className={`pcd-ribbon-cell ${it.muted ? "is-global" : ""}`}>
        <div className="pcd-ribbon-label">{it.label}</div>
        <div className="pcd-ribbon-value">
          {loading ? <span className="pcd-skel pcd-skel-ribbon" /> : it.value}
        </div>
        {it.sub ? <div className="pcd-ribbon-sub">{it.sub}</div> : null}
        {it.note ? <div className="pcd-ribbon-note">{it.note}</div> : null}
      </div>
    ))}
  </div>
);

/* Section heading with a trailing rule, as in the reference layout. */
export const SectionHead = ({ title }) => (
  <div className="pcd-section">
    <span>{title}</span>
    <i />
  </div>
);

/* ================================================================== */
/* Metric card - hero number plus split boxes (no plot)               */
/* ================================================================== */
export const MetricCard = ({ label, value, caption, splits = [], loading, tone = "brand", infoKey, onInfo }) => (
  <div className="pcd-card pcd-metric">
    <div className="pcd-tile-tophead">
      <div className="pcd-metric-label">{label}</div>
      {infoKey ? <InfoButton infoKey={infoKey} onInfo={onInfo} /> : <InfoIcon text={caption} />}
    </div>
    <div className={`pcd-metric-value pcd-tone-${tone}`}>
      {loading ? <span className="pcd-skel pcd-skel-num" /> : nf.format(value ?? 0)}
    </div>
    {caption ? <div className="pcd-metric-cap">{caption}</div> : null}
    {splits.length ? (
      <div className="pcd-splits">
        {splits.map((s) => (
          <div key={s.label} className="pcd-split">
            <div className="pcd-split-label">{s.label}</div>
            <div className="pcd-split-value">{nf.format(s.value ?? 0)}</div>
            {s.sub ? <div className="pcd-split-sub">{s.sub}</div> : null}
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

/* ================================================================== */
/* Switchable chart - the reader picks the form.                      */
/*                                                                     */
/* Only forms that are VALID for the data are offered: a donut is not  */
/* offered past 6 segments (unreadable) or at 2 (a 2-slice pie is an   */
/* anti-pattern), and a line is only offered for an ordered continuous */
/* axis such as hour-of-day - never for nominal categories.            */
/* ================================================================== */
const TYPE_LABEL = {
  bar: "Bar",
  column: "Column",
  donut: "Donut",
  line: "Line",
  share: "Share",
  table: "Table",
};

export const SwitchableChart = ({
  rows,
  types = ["bar", "table"],
  initial,
  unit = "Total",
  tableCols = ["Name", "Value"],
  linePoints,
  lineColor = VIZ.brand,
}) => {
  const [type, setType] = useState(initial || types[0]);
  const active = types.includes(type) ? type : types[0];

  return (
    <>
      <div className="pcd-switch">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            className={`pcd-pill ${active === t ? "is-on" : ""}`}
            onClick={() => setType(t)}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {active === "bar" ? <HBar rows={rows} /> : null}
      {active === "column" ? <ColumnChart rows={rows} /> : null}
      {active === "donut" ? <DonutChart rows={rows} centerLabel={unit} /> : null}
      {active === "share" ? <StackedShareBar rows={rows} /> : null}
      {active === "line" ? <AreaChart points={linePoints || []} color={lineColor} /> : null}
      {active === "table" ? (
        <div className="pcd-table-scroll">
          <table className="pcd-table">
            <thead>
              <tr>
                {tableCols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(linePoints && active === "table" && !rows.length ? linePoints : rows).map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{nf.format(r.value ?? r.count ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};

/* Table view - identity never depends on colour alone. */
export const TableView = ({ columns, rows }) => (
  <details className="pcd-table-toggle">
    <summary>View as table</summary>
    <div className="pcd-table-scroll">
      <table className="pcd-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j}>{typeof cell === "number" ? nf.format(cell) : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);
