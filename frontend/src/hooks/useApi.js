import { useState, useEffect, useCallback } from 'react';

/**
 * useApi — Generic data-fetching hook.
 *
 * @param {Function} fetcher  - An async function that returns data (from api.js)
 * @param {Array}    deps     - Re-fetch when these values change (like useEffect deps)
 *
 * Returns { data, loading, error, refetch }
 *
 * Usage:
 *   const { data, loading, error } = useApi(() => fetchSessions(), []);
 *   const { data, loading, error } = useApi(() => fetchSessionEvents(id), [id]);
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}
