import { useQuery } from '@tanstack/react-query'
import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from 'react-native'

import { ErrorState } from '@/components/error-state'
import { WikiWebView } from '@/components/wiki-webview'
import { getFaqItems } from '@/lib/api'
import { renderFaqBodyHtml } from '@/lib/markdown/renderHtml'
import { wikiTheme } from '@/theme/colors'

export default function FaqScreen() {
  const theme = wikiTheme(useColorScheme())

  // 답변 마크다운(링크·목록 등)을 그대로 살리기 위해 WebView 아코디언으로 렌더링
  const { data: bodyHtml, isLoading, isError, refetch } = useQuery({
    queryKey: ['faq-html'],
    queryFn: async () => {
      const items = await getFaqItems()
      if (items.length === 0) return ''
      return renderFaqBodyHtml(items)
    },
  })

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !bodyHtml ? (
        <View style={styles.center}>
          <Text style={[styles.empty, { color: theme.textMuted }]}>아직 등록된 질문이 없습니다.</Text>
        </View>
      ) : (
        <WikiWebView bodyHtml={bodyHtml} footerText="더 궁금한 점은 관리자에게 문의해 주세요." />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 13 },
})
