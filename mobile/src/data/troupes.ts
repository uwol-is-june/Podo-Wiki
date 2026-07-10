// Copied from src/data/troupes.ts — keep in sync
// logo 상대 경로는 렌더링 시 SITE_URL을 붙여 사용 (단체 추가가 웹 배포만으로 앱에 반영되도록)
export type Troupe = {
  name: string   // 표시할 단체명
  slug: string   // 위키 문서 slug (/w/[slug])
  logo?: string  // 로고 이미지 URL 또는 /public 경로 (없으면 이니셜 플레이스홀더)
}

export const TROUPES: Troupe[] = [
  {
    name: '광운극예술연구회',
    slug: '광운극예술연구회',
    logo: '/logos/광운극예술연구회.png',
  },
]
