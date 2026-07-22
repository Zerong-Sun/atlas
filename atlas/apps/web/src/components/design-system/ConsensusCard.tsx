export function ConsensusCard({ content }: { content: string }) {
  return (
    <section className="consensus-card" aria-label="共识">
      <p className="label" style={{ color: "var(--consensus)" }}>
        共识
      </p>
      <p className="body" style={{ color: "var(--parchment)" }}>
        {content}
      </p>
    </section>
  );
}
