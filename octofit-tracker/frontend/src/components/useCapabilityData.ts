import { useEffect, useState } from 'react';
import type { CapabilityItem } from './CapabilityCard.js';

export function useCapabilityData(request: () => Promise<CapabilityItem[]>) {
  const [items, setItems] = useState<CapabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    request()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'An unexpected error occurred');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [request]);

  return { items, loading, error };
}
