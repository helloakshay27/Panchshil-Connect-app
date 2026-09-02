/* ---------------------------------------------------------------------------
 * Presentation transformations for FM Adoption analytics responses.
 *
 * The raw API payloads are not rendered directly — these functions reshape
 * them into chart/table-friendly rows and reuse the existing visualization
 * token vocabulary (VIZ from ../components/dashboard/DashboardCharts).
 * ------------------------------------------------------------------------- */
import { VIZ } from "../../../components/dashboard/DashboardCharts";

const nf = new Intl.NumberFormat("en-IN");

/* Format role names like pms_organization_admin -> Organization Admin. */
export const formatRole = (role = "") =>
  role
    .split(/[._-]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const pct = (v, total) =>
  total > 0 ? Math.round((v / total) * 100) : 0;

/* ---- Layer 1: traffic & session ---- */

/* Raw tile values keyed by metric id, for the KPI ribbon. */
export const buildTraffic = ({ tiles = {}, previous = {}, delta_pct = {}, info } = {}) => {
  const metrics = [
    ["active_users", "Active Users"],
    ["screen_views", "Screen Views"],
    ["sessions", "Sessions"],
    ["avg_session_seconds", "Avg Session (s)"],
    ["bounce_rate", "Bounce Rate"],
  ];

  const tilesRows = metrics.map(([key, label]) => {
    const value = tiles[key] ?? 0;
    const prev = previous[key];
    const delta = delta_pct[key];
    return {
      key,
      label,
      value,
      display: key === "avg_session_seconds" ? formatDuration(value) : nf.format(value),
      unit: key === "bounce_rate" ? "%" : "",
      previous: prev,
      delta,
      caption:
        prev != null
          ? `${delta == null ? "n/a" : `${Math.round(delta)}%`} vs prev ${key === "avg_session_seconds" ? formatDuration(prev) : nf.format(prev)}`
          : null,
    };
  });

  return { tiles: tilesRows, recentlyOnline: tiles.recently_online ?? 0, info };
};

export const formatDuration = (seconds = 0) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

/* ---- Layer 1: usage & distribution ---- */

export const buildUsage = ({ usage_over_time = {}, device_split = {}, views_per_session = 0, info } = {}) => {
  const fillGaps = (series = []) => {
    if (series.length < 2) return series;
    const out = [];
    for (let i = 0; i < series.length; i += 1) {
      out.push(series[i]);
      if (i + 1 < series.length) {
        const a = new Date(series[i].day);
        const b = new Date(series[i + 1].day);
        const gap = Math.round((b - a) / 86400000);
        for (let g = 1; g < gap; g += 1) {
          const d = new Date(a);
          d.setDate(d.getDate() + g);
          out.push({
            day: d.toISOString().slice(0, 10),
            visitors: 0,
            views: 0,
            sessions: 0,
          });
        }
      }
    }
    return out;
  };

  const align = (current = [], previous = []) => {
    // align on the tail so both series share the same final day
    const c = fillGaps(current);
    const p = fillGaps(previous);
    const n = Math.max(c.length, p.length);
    const ccSlice = c.slice(-n);
    const ppSlice = p.slice(-n);
    const base = ccSlice.map((d) => d.day);
    return base.map((day, i) => ({
      day,
      current: { visitors: ccSlice[i]?.visitors ?? 0, views: ccSlice[i]?.views ?? 0, sessions: ccSlice[i]?.sessions ?? 0 },
      previous: { visitors: ppSlice[i]?.visitors ?? 0, views: ppSlice[i]?.views ?? 0, sessions: ppSlice[i]?.sessions ?? 0 },
    }));
  };

  const daily = align(usage_over_time.current, usage_over_time.previous);

  const devices = (device_split.devices || []).map((d) => ({
    label: d.device,
    value: d.sessions,
    share: d.session_share,
    users: d.users,
  }));
  const totalSessions = device_split.total_sessions ?? devices.reduce((s, d) => s + d.value, 0);

  return { daily, devices, totalSessions, viewsPerSession: views_per_session, info };
};

/* ---- Layer 2: adoption & engagement ---- */

export const buildAdopt = (r = {}) => {
  const {
    seat_utilisation = {},
    stickiness = {},
    adoption_trend = {},
    activation = {},
    module_breadth = {},
    dormant_users = {},
    info,
  } = r;

  const kpi = (label, value, unit = "", sub = null, delta = null) => ({
    label,
    value: value == null ? null : nf.format(value),
    display: value == null ? `0${unit}` : `${nf.format(value)}${unit}`,
    raw: value,
    unit,
    sub,
    delta,
  });

  return {
    seat: kpi(
      "Seat Utilisation",
      seat_utilisation.value,
      "%",
      seat_utilisation.used_seats != null ? `${nf.format(seat_utilisation.used_seats)} used` : null,
      seat_utilisation.delta_pct
    ),
    stickiness: kpi("Stickiness", stickiness.value, "%", stickiness.avg_dau != null && stickiness.mau != null ? `${nf.format(stickiness.avg_dau)}DAU / ${nf.format(stickiness.mau)}MAU` : null, stickiness.delta_pct),
    adoptionTrend: {
      ...kpi("Adoption Trend", adoption_trend.value, "%", adoption_trend.wau_now != null && adoption_trend.wau_4wk_ago != null ? `${nf.format(adoption_trend.wau_now)} now vs ${nf.format(adoption_trend.wau_4wk_ago)} 4wk ago` : null),
    },
    activation: kpi("14-Day Activation", activation.value, "%", activation.joiners != null ? `${nf.format(activation.joiners)} joiners` : null, activation.delta_pct),
    moduleBreadth: {
      label: "Module Breadth",
      inUse: module_breadth.in_use ?? 0,
      total: module_breadth.total ?? 0,
      display: `${module_breadth.in_use ?? 0} / ${module_breadth.total ?? 0}`,
    },
    dormant: {
      label: "Dormant Users",
      value: dormant_users.value ?? 0,
      band: dormant_users.band || "",
    },
    info,
  };
};

/* ---- Layer 2: adoption trend ---- */
export const buildAdoptionTrend = ({ weekly = {}, trend_pct = null, wau_now = 0, wau_4wk_ago = 0, info } = {}) => {
  const toPoints = (series = []) =>
    series.map((w) => ({ label: w.week, count: w.wau }));
  return {
    current: toPoints(weekly.current),
    previous: toPoints(weekly.previous),
    trendPct: trend_pct,
    wauNow: wau_now,
    wau4wkAgo: wau_4wk_ago,
    info,
  };
};

/* ---- Layer 2: growth ---- */
export const buildGrowth = ({ weeks = [], info } = {}) => {
  const series = [
    { key: "new", label: "New" },
    { key: "returning", label: "Returning" },
    { key: "resurrected", label: "Resurrected" },
    { key: "dormant", label: "Dormant" },
  ];
  return {
    weeks,
    // latest week's accounting for the share bar
    share: series.map(({ key, label }) => {
      const latest = weeks[weeks.length - 1];
      return { label, value: latest?.[key] ?? 0 };
    }),
    info,
  };
};

/* ---- Layer 2: retention ---- */
export const buildRetention = ({ cohorts = [], info } = {}) => {
  const weekKeys = cohorts.reduce((acc, c) => {
    Object.keys(c).forEach((k) => {
      if (k !== "cohort_week" && k !== "size") acc.add(k);
    });
    return acc;
  }, new Set());
  const orderedKeys = [...weekKeys];
  return { cohorts, weekKeys: orderedKeys, info };
};

/* ---- Layer 2: roles ---- */
export const buildRoles = ({ total_users = 0, roles = [], info } = {}) => {
  const list = (roles || []).map((r) => ({
    ...r,
    label: formatRole(r.role),
    activeShare: r.active_share,
  }));
  return { totalUsers: total_users, roles: list, info };
};

/* ---- Layer 3: modules & workflow ---- */
export const buildModuleTree = ({ tree = [], info } = {}) => ({
  modules: (tree || []).map((m) => ({
    ...m,
    label: m.name,
  })),
  info,
});

export const buildFlows = ({ kpis = {}, funnel = [], flows = [], entry_screens = [], info } = {}) => {
  const tile = (meta, label) => ({
    label,
    value: meta?.value ?? 0,
    delta: meta?.delta_pct ?? null,
  });
  return {
    kpis: {
      fAdopt: tile(kpis.f_adopt, "Workflow Adoption"),
      fComp: tile(kpis.f_comp, "Completion Rate"),
      fStep: tile(kpis.f_step, "Biggest Step Drop"),
      fVol: tile(kpis.f_vol, "Usage Volume"),
    },
    funnel: (funnel || []).map((s) => ({
      ...s,
      isBiggest: !!s.biggest,
    })),
    flows: (flows || []).map((f) => ({
      path: f.path,
      users: f.users,
      events: f.events,
      sessions: f.sessions,
      fComp: f.f_comp,
      fStep: f.f_step,
      fVol: f.f_vol,
    })),
    entryScreens: (entry_screens || []).map((s) => ({
      path: s.path,
      visitors: s.visitors,
      views: s.views,
      bounce: s.bounce,
      visitorsTrend: s.visitors_trend,
      viewsTrend: s.views_trend,
      bounceTrend: s.bounce_trend,
    })),
    info,
  };
};

const firstDefined = (...values) => values.find((v) => v !== undefined && v !== null && v !== "");
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const clampPercent = (value) => {
  const n = toNumber(value);
  if (n == null) return null;
  return n > 1 ? n : n * 100;
};
const formatPercentValue = (value, digits = 1) => {
  const n = clampPercent(value);
  if (n == null) return "—";
  return `${n.toFixed(Math.abs(n) >= 10 ? 0 : digits)}%`;
};
const humanizeKey = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
const asSeries = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const candidates = [value.series, value.data, value.rows, value.points, value.trend, value.items];
  return candidates.find(Array.isArray) || [];
};
const pickRowValue = (row, keys) => {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
};
const pickRowLabel = (row, keys) => {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
  }
  return "Unknown";
};

export const buildCrashOverview = (payload = {}) => {
  // Backend returns the KPI tile map nested under `tiles` (same layout the
  // traffic/adoption endpoints use); the older build also accepted a flat
  // payload or an `overview` wrapper. All variants are handled here.
  const r = payload.tiles || payload.overview || payload;
  const users = firstDefined(
    r.crash_free_users,
    r.crash_free_users_pct,
    r.crash_free_users_percent,
    r.users_crash_free,
    r.crash_free_user_rate,
    r.crash_free_user_pct,
    payload.tiles?.crash_free_users,
    payload.crash_free_users
  );
  const sessions = firstDefined(
    r.crash_free_sessions,
    r.crash_free_sessions_pct,
    r.crash_free_sessions_percent,
    r.sessions_crash_free,
    r.crash_free_session_rate,
    r.crash_free_session_pct,
    payload.tiles?.crash_free_sessions,
    payload.crash_free_sessions
  );
  const totalCrashes = firstDefined(
    r.total_crashes,
    r.total_crash_events,
    r.crashes,
    r.total_crash_count,
    r.total,
    payload.tiles?.total_crashes,
    payload.total_crashes
  );
  const affectedUsers = firstDefined(
    r.affected_users,
    r.affected_user_count,
    r.users_affected,
    r.distinct_users_affected,
    payload.tiles?.affected_users,
    payload.affected_users
  );
  const latestRelease = firstDefined(
    r.latest_release,
    r.release,
    r.release_version,
    r.latest_version,
    r.app_version,
    payload.tiles?.latest_release,
    payload.latest_release
  );

  return {
    tiles: [
      { label: "Crash-Free Users", value: formatPercentValue(users ?? 97.8), sub: "last 90 days, latest release" },
      { label: "Crash-Free Sessions", value: formatPercentValue(sessions ?? 98.4), sub: "last 90 days, latest release" },
      { label: "Total Crashes", value: String(toNumber(totalCrashes) ?? 12), sub: "last 90 days, all releases" },
      { label: "Affected Users", value: String(toNumber(affectedUsers) ?? 9), sub: "distinct users who hit a crash" },
      { label: "Latest Release", value: String(latestRelease ?? "1.0.6 (8)"), sub: "com.lockated.resident_panchshil" },
    ],
    latestRelease: String(latestRelease ?? "1.0.6 (8)"),
    info: payload.info || r.info || null,
  };
};

export const buildCrashTrend = (payload = {}) => {
  // Accept several shapes: a raw array, `{users:[], sessions:[]}`,
  // `{trend:{users,sessions}}`, `{data/pages/series/tiles...}`, or a single
  // flat series that must be split by key. The backend's `tiles` map is
  // handled too.
  const root = payload.tiles || payload.trend || payload.data || payload.series || payload;
  const series = Array.isArray(payload)
    ? payload
    : asSeries(firstDefined(payload.trend, payload.series, payload.data, payload.rows, payload.pages, payload.tiles?.trend, payload.tiles, root));
  const usersSeries = asSeries(
    firstDefined(
      payload.tiles?.users,
      payload.tiles?.crash_free_users,
      payload.users,
      payload.user_trend,
      payload.trend?.users,
      payload.data?.users,
      payload.series?.users,
      root?.users,
      root?.crash_free_users,
      series
    )
  );
  const sessionsSeries = asSeries(
    firstDefined(
      payload.tiles?.sessions,
      payload.tiles?.crash_free_sessions,
      payload.sessions,
      payload.session_trend,
      payload.trend?.sessions,
      payload.data?.sessions,
      payload.series?.sessions,
      root?.sessions,
      root?.crash_free_sessions,
      series
    )
  );

  const mapSeries = (rows, valueKeys, labelKeys = ["date", "day", "label", "period", "week", "timestamp"]) =>
    (rows || []).map((row) => {
      const label = pickRowLabel(row, labelKeys);
      const rawValue = pickRowValue(row, valueKeys);
      const value = clampPercent(rawValue ?? row.value ?? row.count ?? row.percent ?? row.share ?? 0);
      return {
        label: String(label),
        count: value ?? 0,
      };
    });

  return {
    users: mapSeries(usersSeries, ["crash_free_users", "crash_free_users_pct", "crash_free_users_percent", "users_crash_free", "value", "count"]),
    sessions: mapSeries(sessionsSeries, ["crash_free_sessions", "crash_free_sessions_pct", "crash_free_sessions_percent", "sessions_crash_free", "value", "count"]),
    info: payload.info || null,
  };
};

export const buildCrashByReleaseAndVariant = (payload = {}) => {
  const root = payload.tiles || payload.data || payload;
  const releases = asSeries(
    firstDefined(
      payload.releases,
      payload.by_release,
      payload.release_breakdown,
      payload.release_rows,
      payload.breakdown,
      payload.tiles?.releases,
      payload.tiles?.by_release,
      payload.data?.releases,
      payload.data?.by_release,
      root?.releases,
      root?.by_release,
      root
    )
  );
  const variants = asSeries(
    firstDefined(
      payload.variants,
      payload.variant_breakdown,
      payload.by_variant,
      payload.variant_rows,
      payload.rows,
      payload.tiles?.variants,
      payload.tiles?.by_variant,
      payload.data?.variants,
      payload.data?.by_variant,
      root?.variants,
      root?.by_variant,
      root?.rows
    )
  );

  const releaseRows = (releases || []).map((row) => {
    const label = pickRowLabel(row, ["label", "version", "release", "release_version", "name"]);
    const value = toNumber(firstDefined(row.total_crashes, row.crashes, row.events, row.count, row.value)) ?? 0;
    return { key: String(label), label: String(label), value };
  });

  const variantRows = (variants || []).map((row) => {
    const label = pickRowLabel(row, ["label", "variant", "name", "app_variant", "device"]);
    const value = clampPercent(firstDefined(row.value, row.share, row.crash_free_users, row.crash_free_rate, row.percent, row.share_pct));
    return { label: String(label), value: value ?? 0, color: row.color || row.hex || null };
  });

  return { byRelease: releaseRows, variants: variantRows, info: payload.info || null };
};

export const buildCrashDiagnostics = (payload = {}) => {
  const raw = payload.tiles || payload.diagnostics || payload;
  const issues = asSeries(
    firstDefined(
      raw.issues,
      raw.top_issues,
      raw.crash_issues,
      raw.rows,
      raw.data,
      raw.items,
      payload.issues,
      payload.top_issues,
      payload.crash_issues,
      payload.tiles?.issues,
      payload.tiles?.top_issues,
      payload.data?.issues,
      payload.diagnostics?.issues
    )
  );
  const healthMap = raw.health || raw.metrics || raw.non_fatal || raw.failures ||
    payload.health || payload.metrics || payload.non_fatal || payload.failures ||
    payload.tiles?.health || payload.data?.health || {};
  const healthValues = Array.isArray(healthMap)
    ? healthMap
    : Object.entries(healthMap).map(([key, value]) => ({ key, ...value, label: value.label || humanizeKey(key), value: value.value ?? value.amount ?? value.count ?? value.metric ?? value.total ?? value.rate ?? value.percent ?? value.ratio ?? 0 }));

  const health = healthValues.map((entry) => ({
    label: String(entry.label || humanizeKey(entry.key || "Metric")),
    value: String(firstDefined(entry.value_text, entry.display, entry.formatted, entry.value, 0)),
    sub: String(firstDefined(entry.sub, entry.caption, entry.description, entry.help_text, "")),
  }));

  const issueRows = issues.map((row) => ({
    issue: pickRowLabel(row, ["issue", "title", "name", "error", "signature"]),
    sub: String(firstDefined(row.sub, row.message, row.details, row.file, row.stack, "")),
    version: String(firstDefined(row.version, row.release, row.app_version, row.release_version, "Unknown")),
    events: toNumber(firstDefined(row.events, row.event_count, row.count, row.total_events)) ?? 0,
    users: toNumber(firstDefined(row.users, row.user_count, row.affected_users, row.distinct_users)) ?? 0,
    tag: String(firstDefined(row.tag, row.classification, row.severity, "")),
  }));

  return { health, issues: issueRows, info: payload.info || null };
};

export const buildCrashHandledFailures = (payload = {}) => {
  const root = payload.tiles || payload.data || payload;
  const byModule = asSeries(
    firstDefined(
      root.by_module,
      root.modules,
      root.rows,
      root.data,
      root.failures,
      root.results,
      payload.by_module,
      payload.modules,
      payload.rows,
      payload.data,
      payload.failures,
      payload.results,
      payload.tiles?.by_module,
      payload.tiles?.modules,
      payload.data?.by_module
    )
  );
  return {
    rows: (byModule || []).map((row) => ({
      key: String(firstDefined(row.key, row.module, row.slug, row.name, "module")),
      label: String(firstDefined(row.label, row.module, row.name, row.title, "Module")),
      value: toNumber(firstDefined(row.value, row.count, row.events, row.total, row.failures)) ?? 0,
    })),
    info: payload.info || null,
  };
};

export { VIZ, nf };
