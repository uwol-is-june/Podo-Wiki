'use client'

import { useState } from 'react'
import Link from 'next/link'
import { slugToHref } from '@/lib/wiki/slug'

type RevisionItem = {
  id: string
  edited_at: string
  editor_id: string | null
  comment: string
  contentBytes: number
  bytesDiff: number
}

type ProfileItem = {
  id: string
  name: string
  organization: string
}

function BytesDiff({ diff }: { diff: number }) {
  if (diff === 0) return <span className="text-wiki-text-muted text-xs w-16 shrink-0">±0</span>
  const sign = diff > 0 ? '+' : ''
  const color = diff > 0 ? 'text-green-600' : 'text-red-500'
  return (
    <span className={`${color} text-xs w-16 shrink-0 font-mono`}>
      {sign}{diff.toLocaleString()}
    </span>
  )
}

export default function RevisionList({
  revisions,
  profiles,
  slug,
}: {
  revisions: RevisionItem[]
  profiles: ProfileItem[]
  slug: string
}) {
  const [selected, setSelected] = useState<string[]>([])
  const profileMap = new Map(profiles.map((p) => [p.id, p]))

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const diffHref =
    selected.length === 2
      ? `${slugToHref(slug)}/history/diff?from=${selected[0]}&to=${selected[1]}`
      : null

  return (
    <div>
      <div className="mb-3 flex items-center justify-between min-h-[2rem]">
        <p className="text-xs text-wiki-text-muted">
          {selected.length === 0
            ? '비교할 버전을 2개 선택하세요.'
            : selected.length === 1
              ? '버전을 1개 더 선택하세요.'
              : ''}
        </p>
        {diffHref && (
          <Link
            href={diffHref}
            className="px-4 py-1.5 bg-wiki-accent text-white text-sm rounded hover:bg-wiki-accent-hover transition-colors"
          >
            선택한 버전 비교
          </Link>
        )}
      </div>

      <div className="bg-wiki-surface border border-wiki-border rounded-lg divide-y divide-wiki-border">
        {revisions.length === 0 ? (
          <p className="p-6 text-sm text-wiki-text-muted text-center">수정 역사가 없습니다.</p>
        ) : (
          revisions.map((rev, index) => {
            const profile = rev.editor_id ? profileMap.get(rev.editor_id) : null
            const isLatest = index === 0
            const isSelected = selected.includes(rev.id)
            const isDisabled = !isSelected && selected.length >= 2
            const revNum = revisions.length - index

            return (
              <div key={rev.id} className="flex items-center text-sm">
                <label
                  className="flex items-center px-4 py-3 cursor-pointer shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => toggle(rev.id)}
                    className="w-4 h-4 accent-wiki-accent disabled:opacity-30 cursor-pointer"
                  />
                </label>
                <Link
                  href={`${slugToHref(slug)}/history/${rev.id}`}
                  className="flex flex-1 items-center gap-3 pr-5 py-3 hover:bg-wiki-border/20 transition-colors min-w-0"
                >
                  <span className="text-wiki-text-muted w-7 shrink-0 text-xs font-mono">
                    r{revNum}
                  </span>
                  <span className="text-wiki-text-muted w-36 shrink-0">
                    {new Date(rev.edited_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                  </span>
                  <span className="text-wiki-text shrink-0">
                    {profile
                      ? `${profile.name} (${profile.organization})`
                      : '알 수 없는 사용자'}
                  </span>
                  <BytesDiff diff={rev.bytesDiff} />
                  {rev.comment && (
                    <span className="text-wiki-text-muted truncate text-xs">
                      {rev.comment}
                    </span>
                  )}
                  {isLatest && (
                    <span className="ml-auto text-xs text-wiki-accent font-medium shrink-0">최신</span>
                  )}
                </Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
