export function Loading({ label = "加载中…" }: { label?: string }) {
  return (
    <div className="screen screen--center" role="status" aria-live="polite">
      <div className="spinner" aria-hidden />
      <span className="caption" style={{ marginTop: 16 }}>
        {label}
      </span>
    </div>
  );
}
