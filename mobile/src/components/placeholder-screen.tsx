import { StyleSheet, Text, View, useColorScheme } from 'react-native'

import { wikiTheme } from '@/theme/colors'

// 이후 태스크에서 실제 화면으로 교체되는 임시 화면
export function PlaceholderScreen({ label }: { label: string }) {
  const theme = wikiTheme(useColorScheme())

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label} — 준비 중</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14 },
})
