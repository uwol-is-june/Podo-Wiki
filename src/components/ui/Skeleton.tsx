/**
 * 공용 스켈레톤 로딩 블록.
 * 좌→우로 흐르는 shimmer 하이라이트(globals.css `.skeleton::after`)를 적용한다.
 * `relative overflow-hidden`으로 오버레이를 요소 안에 클립하고, 배경/모서리는
 * 기존 로컬 스켈레톤과 동일하게 `bg-wiki-border/40 rounded`를 사용한다.
 */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`skeleton relative overflow-hidden bg-wiki-border/40 rounded ${className ?? ''}`}
    />
  )
}
