import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native'

import { wikiTheme } from '@/theme/colors'

// 쿼리 실패 공통 표시 (네트워크 오류 등) + 다시 시도
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const theme = wikiTheme(useColorScheme())

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: theme.textMuted }]}>
        불러오지 못했어요.{'\n'}네트워크 연결을 확인해 주세요.
      </Text>
      <Pressable
        style={[styles.button, { borderColor: theme.accent }]}
        onPress={onRetry}
      >
        <Text style={[styles.buttonText, { color: theme.accent }]}>다시 시도</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  message: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  button: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8 },
  buttonText: { fontSize: 13, fontWeight: '600' },
})
