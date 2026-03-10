export function SkeletonLine({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />;
}

export function SkeletonCircle({ size = "w-9 h-9" }: { size?: string }) {
  return <div className={`${size} rounded-full bg-gray-200 animate-pulse flex-shrink-0`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonCircle />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-1/3" />
          <SkeletonLine width="w-1/2" height="h-3" />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine width="w-3/4" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
      <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
      <SkeletonCircle />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="w-1/4" />
        <SkeletonLine width="w-1/6" height="h-3" />
      </div>
      <SkeletonLine width="w-20" />
      <SkeletonLine width="w-32" />
      <SkeletonLine width="w-16" />
      <SkeletonLine width="w-24" />
    </div>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100">
        <SkeletonLine width="w-24" height="h-8" />
        <div className="flex-1" />
        <SkeletonLine width="w-48" height="h-8" />
        <SkeletonLine width="w-20" height="h-8" />
        <SkeletonLine width="w-20" height="h-8" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <SkeletonLine width="w-20" height="h-3" />
              <SkeletonLine width="w-16" height="h-6" />
            </div>
          </div>
          <SkeletonLine width="w-24" height="h-3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonKanban({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[300px]">
          <SkeletonLine width="w-28" height="h-7" />
          <div className="space-y-3 mt-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ))}
    </div>
  );
}
