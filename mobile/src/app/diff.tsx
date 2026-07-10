import { useQuery } from '@tanstack/react-query'
import { diffLines } from 'diff'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' })

import { ErrorState } from '@/components/error-state'
import { editorLabel, formatDateTime, getRevisionPair } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

// 웹 diff 페이지의 green/red 계열을 라이트·다크로 정의
const DIFF_COLORS = {
  light: {
    addBg: '#f0fdf4', addText: '#14532d', addSign: '#22c55e',
    removeBg: '#fef2f2', removeText: '#7f1d1d', removeSign: '#ef4444',
  },
  dark: {
    addBg: 'rgba(34,197,94,0.12)', addText: '#86efac', addSign: '#22c55e',
    removeBg: 'rgba(239,68,68,0.12)', removeText: '#fca5a5', removeSign: '#ef4444',
  },
}

type DiffRow = { key: string; kind: 'add' | 'remove' | 'same'; line: string }

export default function DiffScreen() {
  const { from, to } = useLocalSearchParams<{ from?: string; to?: string }>()
  const scheme = useColorScheme()
  const theme = wikiTheme(scheme)
  const diffColors = scheme === 'dark' ? DIFF_COLORS.dark : DIFF_COLORS.light

  const { data: pair, isLoading, isError, refetch } = useQuery({
    queryKey: ['diff', from, to],
    queryFn: () => getRevisionPair(from!, to!),
    enabled: !!from && !!to,
  })

  // 웹 diff/page.tsx와 동일하게 diffLines(older, newer)를 행 단위로 펼친다
  const rows = useMemo<DiffRow[]>(() => {
    if (!pair) return []
    const [older, newer] = pair
    const changes = diffLines(older.content, newer.content)
    const out: DiffRow[] = []
    changes.forEach((change, i) => {
      const kind = change.added ? 'add' : change.removed ? 'remove' : 'same'
      change.value.replace(/\n$/, '').split('\n').forEach((line, j) => {
        out.push({ key: `${i}-${j}`, kind, line })
      })
    })
    return out
  }, [pair])

  const hasChanges = rows.some(r => r.kind !== 'same')
  const title = pair ? (pair[0].documents?.title ?? pair[0].document_slug) : '버전 비교'

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: `${title} — 비교` }} />

      {!from || !to ? (
        <Text style={[styles.message, { color: theme.textMuted }]}>비교할 버전이 지정되지 않았습니다.</Text>
      ) : isLoading ? (
        <ActivityIndicator color={theme.accent} style={styles.message} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !pair ? (
        <Text style={[styles.message, { color: theme.textMuted }]}>버전을 찾을 수 없습니다.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* 비교 대상 요약 */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: diffColors.removeBg }]}>
              <Text style={[styles.summaryLabel, { color: diffColors.removeSign }]}>이전 버전</Text>
              <Text style={[styles.summaryText, { color: diffColors.removeText }]}>
                {formatDateTime(pair[0].edited_at)}
              </Text>
              <Text style={[styles.summaryMeta, { color: diffColors.removeText }]}>
                {editorLabel(pair[0].editor_id)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: diffColors.addBg }]}>
              <Text style={[styles.summaryLabel, { color: diffColors.addSign }]}>새 버전</Text>
              <Text style={[styles.summaryText, { color: diffColors.addText }]}>
                {formatDateTime(pair[1].edited_at)}
              </Text>
              <Text style={[styles.summaryMeta, { color: diffColors.addText }]}>
                {editorLabel(pair[1].editor_id)}
              </Text>
            </View>
          </View>

          {/* diff 본문 */}
          <View style={[styles.diffBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {!hasChanges ? (
              <Text style={[styles.message, { color: theme.textMuted }]}>두 버전이 동일합니다.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  {rows.map(row => (
                    <View
                      key={row.key}
                      style={[
                        styles.diffRow,
                        row.kind === 'add' && { backgroundColor: diffColors.addBg },
                        row.kind === 'remove' && { backgroundColor: diffColors.removeBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffSign,
                          { borderRightColor: theme.border },
                          row.kind === 'add' && { color: diffColors.addSign },
                          row.kind === 'remove' && { color: diffColors.removeSign },
                        ]}
                      >
                        {row.kind === 'add' ? '+' : row.kind === 'remove' ? '−' : ' '}
                      </Text>
                      <Text
                        style={[
                          styles.diffLine,
                          { color: theme.text },
                          row.kind === 'add' && { color: diffColors.addText },
                          row.kind === 'remove' && {
                            color: diffColors.removeText,
                            textDecorationLine: 'line-through',
                          },
                        ]}
                      >
                        {row.line || ' '}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: 'center', padding: 24, fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  summaryText: { fontSize: 13 },
  summaryMeta: { fontSize: 11, marginTop: 1 },
  diffBox: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  diffRow: { flexDirection: 'row' },
  diffSign: {
    width: 24,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: MONO,
    paddingVertical: 2,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  diffLine: { fontSize: 13, fontFamily: MONO, paddingHorizontal: 10, paddingVertical: 2 },
})
