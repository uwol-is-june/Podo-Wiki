const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-wiki-border/40 rounded animate-pulse ${className ?? ''}`} />
)

export default function MyPageLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <Skeleton className="h-8 w-24 mb-8" />

      <div className="bg-wiki-surface border border-wiki-border rounded-lg divide-y divide-wiki-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center px-4 py-3 gap-4">
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </main>
  )
}
