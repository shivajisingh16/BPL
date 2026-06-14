import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/apiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Manually re-run the fetcher (e.g. after a mutation). */
  refetch: () => void;
}

/**
 * Generic data-fetching hook with loading & error states.
 * `deps` controls when the fetcher re-runs (same semantics as useEffect deps).
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Keep the latest fetcher without forcing it into the dependency array.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (!active) return;
        const message = err instanceof ApiError ? err.message : 'Something went wrong';
        setError(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, refetch };
}
