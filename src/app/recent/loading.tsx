import Skeleton from '@/components/ui/Skeleton'

export default function RecentLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-4 w-52 mb-6" />

      <div className="bg-wiki-surface border border-wiki-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wiki-border bg-wiki-border/10">
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-10" />
              </th>
              <th className="px-4 py-3 text-left w-44">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-4 py-3 text-left w-32 hidden sm:table-cell">
                <Skeleton className="h-4 w-12" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-wiki-border/50">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Skeleton className="h-4 w-16" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
