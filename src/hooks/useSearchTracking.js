import { useEffect, useRef } from "react";
import { useConnectEvents } from "./useConnectEvents";

/**
 * Fire `Connect Module Searched` once the user stops typing.
 *
 * Most list pages in this app filter client-side as each character is entered,
 * so capturing on change would emit one event per keystroke. Debouncing means
 * one event per actual search, and reading the result count through a ref means
 * a late-arriving count does not restart the timer — the event still reports
 * the count that matched the settled query.
 *
 * Empty queries are skipped: clearing a search box is not a search.
 *
 * Usage, once per list page:
 *   useSearchTracking(searchQuery, filteredRows.length);
 */
export function useSearchTracking(query, resultCount, { delay = 800 } = {}) {
  const connectEvents = useConnectEvents();
  const resultCountRef = useRef(resultCount);

  useEffect(() => {
    resultCountRef.current = resultCount;
  }, [resultCount]);

  useEffect(() => {
    const trimmed = (query ?? "").trim();
    if (!trimmed) return undefined;

    const timer = setTimeout(() => {
      connectEvents.onModuleSearched({
        query: trimmed,
        result_count: resultCountRef.current,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay, connectEvents]);
}

export default useSearchTracking;
