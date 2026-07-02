import Skeleton from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* 환영 배너 */}
      <div className="bg-wiki-accent/20 rounded-lg px-8 py-7 mb-5">
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 공연단체 바로가기 */}
      <div className="bg-wiki-surface border border-wiki-border rounded-lg p-5 mb-5">
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3">
              <Skeleton className="w-14 h-14 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* 메인 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        {/* 왼쪽 */}
        <div className="flex flex-col gap-4">
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="divide-y divide-wiki-border/50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="flex flex-col gap-4">
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-wiki-bg rounded-lg">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-10 mx-auto" />
              </div>
              <div className="text-center p-3 bg-wiki-bg rounded-lg">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-10 mx-auto" />
              </div>
            </div>
          </div>
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
