import { ChartCard } from "../../../components/dashboard/DashboardCharts";

/* Loading spinner while the first batch is in flight. */
export const LoadingState = ({ label = "Loading analytics…" }) => (
  <div className="pcd-state" role="status">
    <span className="pcd-spinner" aria-hidden="true" />
    <span className="pcd-state-empty">{label}</span>
  </div>
);

/* Retryable error state — never silently fail. */
export const ErrorState = ({ message = "Could not load analytics data.", onRetry }) => (
  <div className="pcd-fail">
    <div className="pcd-state pcd-state-error">{message}</div>
    {onRetry ? (
      <button type="button" className="pcd-btn pcd-btn-primary" onClick={onRetry}>
        Retry
      </button>
    ) : null}
  </div>
);

/* Wrapper to render a ChartCard with query loading/error handling. */
export const QueryCard = ({ title, subtitle, query, empty, children, onRetry, legend }) => {
  const loading = query.isLoading || (query.isFetching && !query.data);
  const error = query.isError ? query.error?.message || "Failed to load" : null;
  const isEmpty = !loading && !error && empty;

  return (
    <ChartCard title={title} subtitle={subtitle} loading={loading} error={error} empty={isEmpty} legend={legend}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={onRetry} /> : isEmpty ? null : children}
    </ChartCard>
  );
};
