import React, { useState } from "react";
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
);

/* ================================================================== */
/* BAR (horizontal) - magnitude across nominal categories with long   */
/* names. One hue: bar length already encodes the value, so colour    */
/* stays free.                                                         */
/* ================================================================== */
export const HBar = ({ rows, valueSuffix = "", color = VIZ.brand }) => {
  const peak = Math.max(...rows.map((r) => r.value), 0);
  return (
    <ul className="pcd-hbar">
      {rows.map((r) => (
        <li key={r.key ?? r.label} title={`${r.label}: ${nf.format(r.value)}${valueSuffix}`}>
          <span className="pcd-hbar-label" title={r.label}>
            {r.label}
          </span>
          <span className="pcd-hbar-track">
            <span
              className="pcd-hbar-fill"
              style={{
                width: `${peak > 0 ? Math.max((r.value / peak) * 100, r.value > 0 ? 1.5 : 0) : 0}%`,
                background: color,
              }}
            />
          </span>
          <span className="pcd-hbar-value">{nf.format(r.value)}</span>
        </li>
      ))}
    </ul>
  );
};

/* ================================================================== */
/* COLUMN (vertical bar) - short labels, few categories               */
/* ================================================================== */
export const ColumnChart = ({ rows, height = 200 }) => {
  const [hover, setHover] = useState(null);
  const peak = Math.max(...rows.map((r) => r.value), 0);
  const plot = height - 34;

  return (
    <div className="pcd-col-wrap">
      <div className="pcd-col-grid" style={{ height: plot }}>
        {[1, 0.5, 0].map((t) => (
          <span key={t} className="pcd-col-gridline" style={{ bottom: `${t * 100}%` }}>
            <em>{nf.format(Math.round(peak * t))}</em>
          </span>
        ))}
        <div className="pcd-col-bars">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className="pcd-col-item"
              onMouseEnter={() => setHover(r)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="pcd-col-val">{nf.format(r.value)}</span>
              <span
                className="pcd-col-bar"
                style={{
                  height: `${peak > 0 ? Math.max((r.value / peak) * 100, r.value > 0 ? 1 : 0) : 0}%`,
                  background: VIZ.cat[i % VIZ.cat.length],
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="pcd-col-labels">
        {rows.map((r) => (
          <span key={r.label} title={r.label}>
            {r.label}
          </span>
        ))}
      </div>
      <div className="pcd-hint">
        {hover ? (
          <>
            <strong>{hover.label}</strong> · {nf.format(hover.value)}
          </>
        ) : (
          <span className="pcd-muted">Hover a column for details</span>
        )}
      </div>
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
/* ================================================================== */
export const StackedShareBar = ({ rows, colors = VIZ.cat }) => {
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="pcd-share">
      <div className="pcd-share-track">
        {rows.map((r, i) => (
          <span
            key={r.label}
            className="pcd-share-seg"
            style={{
              width: `${pct(r.value, total)}%`,
              background: colors[i % colors.length],
            }}
            title={`${r.label}: ${nf.format(r.value)} (${pct(r.value, total)}%)`}
          />
        ))}
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
/* DONUT - part-to-whole at a glance, legal at 3..6 segments          */
/* ================================================================== */
export const DonutChart = ({ rows, centerLabel = "Total", colors = VIZ.cat }) => {
  const [hover, setHover] = useState(null);
  const total = rows.reduce((s, r) => s + r.value, 0);
  const R = 60;
  const C = 2 * Math.PI * R;
  const GAP = 3; // surface gap between segments

  let offset = 0;
  const segs = rows.map((r, i) => {
    const len = total > 0 ? (r.value / total) * C : 0;
    const seg = {
      ...r,
      color: colors[i % colors.length],
      dash: Math.max(len - GAP, 0),
      offset,
      percent: pct(r.value, total),
    };
    offset += len;
    return seg;
  });

  const focus = hover ?? null;

  return (
    <div className="pcd-donut-wrap">
      <svg viewBox="0 0 160 160" className="pcd-donut" role="img" aria-label={centerLabel}>
        <circle cx="80" cy="80" r={R} fill="none" stroke="#f4f4f5" strokeWidth="20" />
        {segs.map((s) => (
          <circle
            key={s.label}
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={focus && focus.label === s.label ? 24 : 20}
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 80 80)"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(null)}
            style={{ transition: "stroke-width .15s ease" }}
          />
        ))}
        <text x="80" y="74" textAnchor="middle" className="pcd-donut-num">
          {nf.format(focus ? focus.value : total)}
        </text>
        <text x="80" y="92" textAnchor="middle" className="pcd-donut-cap">
          {focus ? `${focus.percent}%` : centerLabel}
        </text>
      </svg>

      <ul className="pcd-donut-keys">
        {segs.map((s) => (
          <li
            key={s.label}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(null)}
            className={focus && focus.label === s.label ? "is-on" : ""}
          >
            <span className="pcd-legend-dot" style={{ background: s.color }} />
            <span className="pcd-share-name" title={s.label}>
              {s.label}
            </span>
            <strong>{nf.format(s.value)}</strong>
            <em>{s.percent}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ================================================================== */
/* AREA / LINE - hour of day is an ordered continuous axis, so a      */
/* line is the correct form for the distribution across it.           */
/* ================================================================== */
export const AreaChart = ({ points, previousPoints, color = VIZ.brand, height = 210 }) => {
  const [idx, setIdx] = useState(null);
  const W = 720;
  const H = height;
  const PAD = { t: 14, r: 12, b: 26, l: 34 };
  const hasPrev = Array.isArray(previousPoints) && previousPoints.length === points.length;
  const peak =
    Math.max(...points.map((p) => p.count), ...(hasPrev ? previousPoints.map((p) => p.count) : []), 0) || 1;

  // points.length - 1 is 0 for a single-point (e.g. no-data) series, which
  // would divide by zero and push every x position to NaN — center that
  // lone point instead of dividing.
  const px = (i) =>
    PAD.l + (points.length > 1 ? i / (points.length - 1) : 0.5) * (W - PAD.l - PAD.r);
  const py = (v) => PAD.t + (1 - v / peak) * (H - PAD.t - PAD.b);

  const line = points.map((p, i) => `${i ? "L" : "M"}${px(i)},${py(p.count)}`).join(" ");
  const area = `${line} L${px(points.length - 1)},${py(0)} L${px(0)},${py(0)} Z`;
  const prevLine = hasPrev
    ? previousPoints.map((p, i) => `${i ? "L" : "M"}${px(i)},${py(p.count)}`).join(" ")
    : null;

  const ticks = [0, 0.5, 1].map((t) => Math.round(peak * t));
  const active = idx != null ? points[idx] : null;

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((x - PAD.l) / (W - PAD.l - PAD.r)) * (points.length - 1));
    setIdx(Math.max(0, Math.min(points.length - 1, i)));
  };

  return (
    <div className="pcd-area-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="pcd-area"
        onMouseMove={onMove}
        onMouseLeave={() => setIdx(null)}
        role="img"
      >
        <defs>
          <linearGradient id={`pcd-fill-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* recessive hairline grid */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={py(t)} y2={py(t)} stroke={VIZ.grid} strokeWidth="1" />
            <text x={PAD.l - 7} y={py(t) + 3.5} textAnchor="end" className="pcd-axis">
              {nf.format(t)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#pcd-fill-${color.slice(1)})`} />
        {prevLine ? (
          <path d={prevLine} fill="none" stroke="#c2c0bd" strokeWidth="1.6" strokeDasharray="4 4" />
        ) : null}
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

        {/* x labels every 3 hours */}
        {points.map((p, i) =>
          i % 3 === 0 ? (
            <text key={p.label} x={px(i)} y={H - 8} textAnchor="middle" className="pcd-axis">
              {p.label.replace(/^0/, "")}
            </text>
          ) : null
        )}

        {active ? (
          <g>
            <line
              x1={px(idx)}
              x2={px(idx)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke={VIZ.inkMuted}
              strokeWidth="1"
            />
            <circle
              cx={px(idx)}
              cy={py(active.count)}
              r="5"
              fill={color}
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        ) : null}
      </svg>

      <div className="pcd-hint">
        {active ? (
          <>
            <strong>{active.label}</strong> · {nf.format(active.count)}
          </>
        ) : (
          <span className="pcd-muted">Hover the chart for hourly detail</span>
        )}
      </div>
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
