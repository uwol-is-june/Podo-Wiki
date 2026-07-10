import type { ReactNode } from 'react'
import { Platform, StyleSheet, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { wikiTheme } from '@/theme/colors'

// 네이티브 탭 바가 콘텐츠 위에 겹치는 만큼 리스트 하단에 줄 여백
export const BOTTOM_TAB_INSET = Platform.select({ ios: 50, android: 80 }) ?? 0

// 탭 화면 공통 셸: 상단 안전영역 + 큰 제목 (스택 헤더가 없는 탭 전용)
export function TabScreen({ title, children }: { title: string; children: ReactNode }) {
  const theme = wikiTheme(useColorScheme())
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  body: { flex: 1 },
})
