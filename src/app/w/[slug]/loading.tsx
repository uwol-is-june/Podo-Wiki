const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-wiki-border/40 rounded animate-pulse ${className ?? ''}`} />
)

export default function WikiPageLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* 문서 헤더 */}
      <div className="mb-0">
        <Skeleton className="h-8 w-64 mb-3" />
        <div className="flex items-center gap-0 border-b border-wiki-border pb-0">
          <Skeleton className="h-9 w-12 mr-2" />
          <Skeleton className="h-9 w-12 mr-2" />
          <Skeleton className="h-9 w-12" />
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="flex gap-6 mt-6">
        <article className="flex-1 min-w-0 bg-wiki-surface border border-wiki-border rounded-lg p-6 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-3 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </article>

        {/* 데스크탑 TOC 자리 */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-3 space-y-2">
            <Skeleton className="h-4 w-16 mb-2" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </aside>
      </div>

      <Skeleton className="h-3 w-40 mt-4" />
    </div>
  )
}
