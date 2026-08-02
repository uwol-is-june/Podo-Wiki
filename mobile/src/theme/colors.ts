import type { ColorSchemeName } from 'react-native'

export interface WikiTheme {
  bg: string
  surface: string
  text: string
  textMuted: string
  /** 버튼 등 '배경'용 — 이 위에 올라가는 글자색은 onAccent */
  accent: string
  accentHover: string
  /** 링크·라벨 등 '텍스트'용. 다크모드에선 accent보다 밝다 (가독성) */
  accentText: string
  /** accent 배경 '위에 올라가는 글자'색 (accentText와 반대 방향이니 혼동 주의) */
  onAccent: string
  border: string
  headerBg: string
  headerText: string
}

// Copied from src/app/globals.css (--wiki-*) — keep in sync
export const WikiColors: { light: WikiTheme; dark: WikiTheme } = {
  light: {
    bg: '#f7f5fc',
    surface: '#ffffff',
    text: '#1c1128',
    textMuted: '#6b6080',
    accent: '#6a39c0',
    accentHover: '#5528a8',
    accentText: '#6a39c0',
    onAccent: '#ffffff',
    border: '#ddd5f0',
    headerBg: '#6a39c0',
    headerText: '#ffffff',
  },
  dark: {
    bg: '#130d1f',
    surface: '#1e1530',
    text: '#e5dff5',
    textMuted: '#9080b8',
    accent: '#9b6de0',
    accentHover: '#b389f0',
    // 배경용(#9b6de0)은 surface 위 4.69:1로 본문 가독성이 부족해서 텍스트만 밝힌 값 (→ 7.62:1)
    accentText: '#c09bf0',
    // 다크에선 흰 글씨가 accent 배경 위에서 3.71:1(AA 미달)이라 어두운 글자로 뒤집음 (5.12:1)
    onAccent: '#130d1f',
    border: '#352558',
    headerBg: '#1e1530',
    headerText: '#e5dff5',
  },
}

export function wikiTheme(scheme: ColorSchemeName): WikiTheme {
  return scheme === 'dark' ? WikiColors.dark : WikiColors.light
}
