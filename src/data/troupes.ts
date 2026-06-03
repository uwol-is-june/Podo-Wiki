export type Troupe = {
  name: string   // 표시할 단체명
  slug: string   // 위키 문서 slug (/w/[slug])
  logo?: string  // 로고 이미지 URL 또는 /public 경로 (없으면 이니셜 플레이스홀더)
}

// 단체 추가 요청 시 이 배열에 추가
export const TROUPES: Troupe[] = [

]
