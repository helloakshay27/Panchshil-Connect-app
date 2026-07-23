import { VIZ } from "./DashboardCharts";

const nf = new Intl.NumberFormat("en-IN");

/* Columns whose values read better right-aligned / centred. */
const CENTERED = new Set([
  "published",
  "is_sold",
  "site_visit",
  "status",
  "is_important",
  "active",
  "rsvp_action",
]);

/* Yes / No and status values carry a small pill so they scan at a glance. */
const Pill = ({ value }) => {
  const v = String(value ?? "").toLowerCase();
  const tone =
    v === "yes" ? "on" : v === "no" ? "off" : v === "cancelled" ? "bad" : "neutral";
  return <span className={`pcd-cell-pill pcd-cell-${tone}`}>{value || "-"}</span>;
};

export const DataTable = ({
  columns = [],
  rows = [],
  pagination,
  loading,
  error,
  onPage,
  onExport,
  exporting,
}) => {
  const { current_page: page = 1, total_pages: pages = 1, total_count: total = 0, per_page: per = 20 } =
    pagination || {};
  const first = total === 0 ? 0 : (page - 1) * per + 1;
  const last = Math.min(page * per, total);

  /* A compact window of page buttons around the current page. */
  const windowed = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const out = [1];
    const lo = Math.max(2, page - 1);
    const hi = Math.min(pages - 1, page + 1);
    if (lo > 2) out.push("…");
    for (let i = lo; i <= hi; i += 1) out.push(i);
    if (hi < pages - 1) out.push("…");
    out.push(pages);
    return out;
  };

  return (
    <div className="pcd-card pcd-datatable">
      <div className="pcd-dt-head">
        <div className="pcd-dt-count">
          {loading ? (
            "Loading…"
          ) : error ? (
            ""
          ) : (
            <>
              Showing <b>{nf.format(first)}</b>–<b>{nf.format(last)}</b> of{" "}
              <b>{nf.format(total)}</b>
            </>
          )}
        </div>
        <button
          type="button"
          className="pcd-btn pcd-btn-primary pcd-dt-export"
          onClick={onExport}
          disabled={exporting || loading || !total}
        >
          {exporting ? "Preparing…" : "Export to Excel"}
        </button>
      </div>

      {error ? (
        <div className="pcd-state pcd-state-error">{error}</div>
      ) : loading ? (
        <div className="pcd-state">
          <span className="pcd-skel pcd-skel-row" />
          <span className="pcd-skel pcd-skel-row" />
          <span className="pcd-skel pcd-skel-row" />
          <span className="pcd-skel pcd-skel-row" />
        </div>
      ) : !rows.length ? (
        <div className="pcd-state pcd-state-empty">No records for the selected filters</div>
      ) : (
        <div className="pcd-dt-scroll">
          <table className="pcd-dt">
            <thead>
              <tr>
                <th className="pcd-dt-idx">#</th>
                {columns.map((c) => (
                  <th key={c.key} className={CENTERED.has(c.key) ? "is-center" : ""}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="pcd-dt-idx">{first + i}</td>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={CENTERED.has(c.key) ? "is-center" : ""}
                      title={typeof row[c.key] === "string" ? row[c.key] : undefined}
                    >
                      {CENTERED.has(c.key) ? (
                        <Pill value={row[c.key]} />
                      ) : (
                        row[c.key] || <span className="pcd-muted">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && !loading && pages > 1 ? (
        <div className="pcd-pager">
          <button
            type="button"
            className="pcd-pager-btn"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          {windowed().map((p, i) =>
            p === "…" ? (
              <span key={`gap${i}`} className="pcd-pager-gap">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`pcd-pager-btn ${p === page ? "is-on" : ""}`}
                onClick={() => onPage(p)}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            className="pcd-pager-btn"
            onClick={() => onPage(page + 1)}
            disabled={page >= pages}
          >
            Next →
          </button>
        </div>
      ) : null}
    </div>
  );
};

export { VIZ };
export default DataTable;
