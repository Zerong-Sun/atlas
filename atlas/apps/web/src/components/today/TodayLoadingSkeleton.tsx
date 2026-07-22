export function TodayLoadingSkeleton() {
  return (
    <div className="today-skeleton" role="status" aria-live="polite" aria-label="加载今日简报">
      <div className="today-skeleton__slip">
        <div className="today-skeleton__line today-skeleton__line--short" />
        <div className="today-skeleton__line" />
        <div className="today-skeleton__line today-skeleton__line--wide" />
        <div className="today-skeleton__line" style={{ width: "70%" }} />
      </div>
    </div>
  );
}
