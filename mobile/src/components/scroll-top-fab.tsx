import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native'

import { wikiTheme } from '@/theme/colors'

type Props = {
  visible: boolean
  onPress: () => void
}

// 본문(WebView) 최상단으로 올리는 플로팅 버튼.
// 일정 이상 스크롤됐을 때만 나타난다 — 노출 판단은 부모(문서 화면)가 WebView onScroll로 한다.
export function ScrollTopFab({ visible, onPress }: Props) {
  const theme = wikiTheme(useColorScheme())

  if (!visible) return null

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="맨 위로"
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.accent,
          borderColor: theme.bg,
          opacity: pressed ? 0.75 : 0.95,
        },
      ]}
    >
      <Text style={[styles.icon, { color: theme.onAccent }]}>↑</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    // Android 그림자
    elevation: 4,
    // iOS 그림자
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
})
