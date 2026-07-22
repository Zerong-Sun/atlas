type Props<T> = {
  title?: string;
  items: T[];
  renderItem: (item: T, index: number) => { key: string; label: string; detail?: string };
};

export function MethodHistoryPanel<T>({ title = "最近记录", items, renderItem }: Props<T>) {
  if (items.length <= 1) return null;

  return (
    <section className="method-history" aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {items.slice(1).map((item, index) => {
          const { key, label, detail } = renderItem(item, index + 1);
          return (
            <li key={key}>
              <strong>{label}</strong>
              {detail && <p>{detail}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
