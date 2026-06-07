'use client'

import { useState } from 'react'
import Link from 'next/link'

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
}: {
  revisions: RevisionItem[]
  profiles: ProfileItem[]
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
      ? `/diff?from=${selected[0]}&to=${selected[1]}`
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
                  href={`/revision/${rev.id}`}
                  className="flex flex-1 min-w-0 flex-col sm:flex-row sm:items-center sm:gap-3 pr-5 py-2.5 sm:py-3 hover:bg-wiki-border/20 transition-colors"
                >
                  {/* 모바일 1행: r번호 + 날짜 + 최신 뱃지 */}
                  <div className="flex items-center gap-2 sm:contents">
                    <span className="text-wiki-text-muted w-7 shrink-0 text-xs font-mono">
                      r{revNum}
                    </span>
                    <span className="text-wiki-text-muted text-xs sm:w-36 sm:shrink-0">
                      {new Date(rev.edited_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                    </span>
                    {isLatest && (
                      <span className="ml-auto text-xs text-wiki-accent font-medium shrink-0 sm:hidden">최신</span>
                    )}
                  </div>
                  {/* 모바일 2행: 편집자 + 바이트차이 + 요약 */}
                  <div className="flex items-center gap-2 mt-0.5 pl-9 sm:contents">
                    <span className="text-wiki-text shrink-0 text-sm">
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
                  </div>
                  {isLatest && (
                    <span className="hidden sm:block ml-auto text-xs text-wiki-accent font-medium shrink-0">최신</span>
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
