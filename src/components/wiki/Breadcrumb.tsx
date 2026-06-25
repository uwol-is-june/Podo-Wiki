import Link from 'next/link'
import { slugToHref } from '@/lib/wiki/slug'

type BreadcrumbItem = {
  slug: string
  label: string
  exists: boolean
}

type Props = {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm text-wiki-text-muted mb-2 flex-wrap">
      {items.map((item, i) => (
        <span key={item.slug} className="flex items-center gap-1">
          {i > 0 && <span className="select-none">›</span>}
          <Link href={slugToHref(item.slug)} className="hover:text-wiki-text transition-colors">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  )
}
