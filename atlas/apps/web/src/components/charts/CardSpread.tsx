interface CardSpreadProps {
  cards: Array<{ id: number | string; name: string; position?: string; highlight?: boolean }>;
  columns?: number;
}

export function CardSpread({ cards, columns = 3 }: CardSpreadProps) {
  return (
    <div className="card-spread" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {cards.map((card) => (
        <article key={card.id} className={card.highlight ? "card-spread__card card-spread__card--hi" : "card-spread__card"}>
          {card.position && <span>{card.position}</span>}
          <strong>{card.name}</strong>
        </article>
      ))}
    </div>
  );
}
