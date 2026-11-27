export type CapabilityItem = Record<string, unknown>;
type Props = {
  title: string;
  description: string;
  items: CapabilityItem[];
  loading: boolean;
  error?: string;
  emptyMessage: string;
};

export function CapabilityCard({ title, description, items, loading, error, emptyMessage }: Props) {
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
