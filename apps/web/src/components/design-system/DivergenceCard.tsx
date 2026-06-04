export function DivergenceCard({ content }: { content: string }) {
  return (
    <section className="divergence-card" aria-label="分歧">
      <p className="label" style={{ color: "var(--divergence)" }}>
        分歧
      </p>
      <p className="body" style={{ color: "var(--parchment)" }}>
        {content}
      </p>
    </section>
  );
}
