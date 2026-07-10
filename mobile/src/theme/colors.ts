import type { ColorSchemeName } from 'react-native'

export interface WikiTheme {
  bg: string
  surface: string
  text: string
  textMuted: string
  accent: string
  accentHover: string
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
    border: '#352558',
    headerBg: '#1e1530',
    headerText: '#e5dff5',
  },
}

export function wikiTheme(scheme: ColorSchemeName): WikiTheme {
  return scheme === 'dark' ? WikiColors.dark : WikiColors.light
}
