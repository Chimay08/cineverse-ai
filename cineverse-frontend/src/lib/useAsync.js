import { useEffect, useState } from "react";

// Tiny async-data hook with loading state. Re-runs when any dep changes.
export default function useAsync(fn, deps = [], initial = null) {
  const [data, setData] = useState(initial);
  
  // Stale-While-Revalidate check
  const hasInitial = initial !== null && (!Array.isArray(initial) || initial.length > 0);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!hasInitial) {
      setLoading(true);
    }
    Promise.resolve(fn())
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

// Scroll to top on route change.
export function useScrollTop(dep) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [dep]);
}
