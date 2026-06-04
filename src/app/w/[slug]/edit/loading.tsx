const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-wiki-border/40 rounded animate-pulse ${className ?? ''}`} />
)

export default function EditPageLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* 제목 입력 */}
      <Skeleton className="h-10 w-full mb-4" />

      {/* 툴바 */}
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" />
        ))}
      </div>

      {/* 에디터 본문 */}
      <Skeleton className="h-[480px] w-full rounded-lg" />

      {/* 저장 버튼 */}
      <div className="flex justify-end mt-4">
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}
