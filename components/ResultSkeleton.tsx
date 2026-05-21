export function ResultSkeleton() {
  return (
    <div className="rounded-card bg-canvas-white p-6 shadow-[var(--shadow-subtle)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="h-5 w-3/5 animate-pulse rounded-full bg-subtle-cream" />
        <div className="h-5 w-20 animate-pulse rounded-pill bg-subtle-cream" />
      </div>
      <div className="mb-3 h-3 w-2/5 animate-pulse rounded-full bg-subtle-cream" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-subtle-cream" />
        <div className="h-3 w-11/12 animate-pulse rounded-full bg-subtle-cream" />
        <div className="h-3 w-9/12 animate-pulse rounded-full bg-subtle-cream" />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="h-7 w-24 animate-pulse rounded-pill bg-subtle-cream" />
        <div className="h-4 w-32 animate-pulse rounded-full bg-subtle-cream" />
        <div className="h-6 w-24 animate-pulse rounded-pill bg-subtle-cream" />
      </div>
    </div>
  );
}

export function ResultSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <span className="sr-only">Memuat hasil pencarian</span>
      {Array.from({ length: count }).map((_, i) => (
        <ResultSkeleton key={i} />
      ))}
    </div>
  );
}
