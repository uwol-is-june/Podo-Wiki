import Skeleton from '@/components/ui/Skeleton'

export default function SearchLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <Skeleton className="h-8 w-48 mb-1" />
      <Skeleton className="h-4 w-36 mb-6" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-wiki-surface border border-wiki-border rounded-lg px-5 py-4"
          >
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
