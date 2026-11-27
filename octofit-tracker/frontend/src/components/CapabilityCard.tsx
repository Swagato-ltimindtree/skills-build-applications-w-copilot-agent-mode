import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type ApiItem = Record<string, unknown>;
type Props = {
  title: string;
  description: string;
  endpoint: string;
  responseKey: string;
  emptyMessage: string;
};

export function CapabilityCard({ title, description, endpoint, responseKey, emptyMessage }: Props) {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    getJson<Record<string, ApiItem[]>>(endpoint)
      .then((response) => {
        const result = response[responseKey];
        if (!Array.isArray(result)) throw new Error('The server returned an invalid response');
        if (active) setItems(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'An unexpected error occurred');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [endpoint, responseKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading ? <p role="status">Loading {title.toLowerCase()}...</p>
          : error ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
            : items.length === 0 ? <p>{emptyMessage}</p>
              : <ul>{items.map((item, index) => (
                <li key={String(item._id ?? index)}>
                  {Object.entries(item)
                    .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
                    .map(([key, value]) => <span key={key} className="me-2">{key}: {String(value)}</span>)}
                </li>
              ))}</ul>}
      </div>
    </section>
  );
}
