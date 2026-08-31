import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTrafficSession,
  fetchUsageAndDistribution,
  fetchAdoptionEngagement,
  fetchAdoptionTrend,
  fetchCrashOverview,
  fetchCrashTrend,
  fetchCrashByReleaseAndVariant,
  fetchCrashDiagnostics,
  fetchCrashHandledFailures,
  fetchGrowth,
  fetchRetention,
  fetchRoles,
  fetchModules,
  fetchWorkflowUsage,
} from "./adoptionApi";

/* ---------------------------------------------------------------------------
 * React Query hooks — one per endpoint. Each analytics call is a multi-second
 * server scan, so we cache generously:
 *   staleTime  5m  — don't refetch a settled query for 5 minutes
 *   gcTime    30m  — keep resolved data cached for 30 minutes after unmount
 *   refetchOnWindowFocus false
 * ------------------------------------------------------------------------- */

export const ANALYTICS_QUERY_KEY = "fm-adoption";
export const CONTINUOUS_QUERY_KEY = "fm-adoption-continuous";

/* Gate every analytics query on `enabled` (defaults to true) so the caller can
   hold them back until the allowed-sites list has settled and the filter state
   is fully formed — prevents the initial whole-tenant double-fire. */
const common = { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false };

export const useTrafficSession = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "traffic_session", filters],
    queryFn: () => fetchTrafficSession(filters),
    ...common,
    ...opts,
  });

export const useTrafficSessionPerSite = (siteId, filters, opts = {}) =>
  useQuery({
    queryKey: [CONTINUOUS_QUERY_KEY, "traffic_session", "site", siteId, filters],
    queryFn: () => fetchTrafficSession({ ...filters, siteIds: [siteId] }),
    ...common,
    ...opts,
  });

export const useUsageAndDistribution = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "usage_and_distribution", filters],
    queryFn: () => fetchUsageAndDistribution(filters),
    ...common,
    ...opts,
  });

export const useAdoptionEngagement = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "adoption_engagement", filters],
    queryFn: () => fetchAdoptionEngagement(filters),
    ...common,
    ...opts,
  });

export const useAdoptionTrend = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "adoption_trend", filters],
    queryFn: () => fetchAdoptionTrend(filters),
    ...common,
    ...opts,
  });

export const useGrowth = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "growth", filters],
    queryFn: () => fetchGrowth(filters),
    ...common,
    ...opts,
  });

export const useRetention = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "retention", filters],
    queryFn: () => fetchRetention(filters),
    ...common,
    ...opts,
  });

export const useRoles = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "roles", filters],
    queryFn: () => fetchRoles(filters),
    ...common,
    ...opts,
  });

export const useModuleTree = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "modules", filters],
    queryFn: () => fetchModules(filters),
    ...common,
    ...opts,
  });

export const useSubModuleTree = (module, filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "modules", { ...filters, module }],
    queryFn: () => fetchModules({ ...filters, module }),
    ...common,
    ...opts,
  });

export const useWorkflowUsage = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "workflow_usage", filters],
    queryFn: () => fetchWorkflowUsage(filters),
    ...common,
    ...opts,
  });

export const useCrashOverview = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "crash_overview", filters],
    queryFn: () => fetchCrashOverview(filters),
    ...common,
    ...opts,
  });

export const useCrashTrend = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "crash_trend", filters],
    queryFn: () => fetchCrashTrend(filters),
    ...common,
    ...opts,
  });

export const useCrashByReleaseAndVariant = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "crash_by_release_and_variant", filters],
    queryFn: () => fetchCrashByReleaseAndVariant(filters),
    ...common,
    ...opts,
  });

export const useCrashDiagnostics = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "crash_diagnostics", filters],
    queryFn: () => fetchCrashDiagnostics(filters),
    ...common,
    ...opts,
  });

export const useCrashHandledFailures = (filters, opts = {}) =>
  useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, "crash_handled_failures", filters],
    queryFn: () => fetchCrashHandledFailures(filters),
    ...common,
    ...opts,
  });

/* Refresh control — invalidates and refetches the whole analytics family
   including the per-site continuous fan-out. */
export const useRefreshAnalytics = () => {
  const client = useQueryClient();
  return () =>
    client.invalidateQueries({
      queryKey: [ANALYTICS_QUERY_KEY],
      refetchType: "active",
    }).then(() =>
      client.invalidateQueries({
        queryKey: [CONTINUOUS_QUERY_KEY],
        refetchType: "active",
      })
    );
};
