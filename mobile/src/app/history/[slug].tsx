import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

import { ErrorState } from '@/components/error-state'
import { editorLabel, formatDateTime, getHistory } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

const DIFF_GREEN = '#22c55e'
const DIFF_RED = '#ef4444'

// 웹 RevisionList의 바이트 증감 표기와 동일
function BytesDiff({ diff, mutedColor }: { diff: number; mutedColor: string }) {
  if (diff === 0) return <Text style={[styles.bytes, { color: mutedColor }]}>±0</Text>
  const sign = diff > 0 ? '+' : ''
  return (
    <Text style={[styles.bytes, { color: diff > 0 ? DIFF_GREEN : DIFF_RED }]}>
      {sign}
      {diff.toLocaleString()}
    </Text>
  )
}

export default function HistoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const [selected, setSelected] = useState<string[]>([])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['history', slug],
    queryFn: () => getHistory(slug),
  })

  // 웹 RevisionList와 동일: 최대 2개 선택
  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const revisions = data?.revisions ?? []

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: data ? `${data.title} — 역사` : '문서 역사' }} />

      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={styles.loading} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={[styles.toolbarHint, { color: theme.textMuted }]}>
              {selected.length === 0
                ? '비교할 버전을 2개 선택하세요.'
                : selected.length === 1
                  ? '버전을 1개 더 선택하세요.'
                  : ''}
            </Text>
            {selected.length === 2 && (
              <Pressable
                style={[styles.diffButton, { backgroundColor: theme.accent }]}
                onPress={() =>
                  router.push({
                    pathname: '/diff',
                    params: { from: selected[0], to: selected[1] },
                  })
                }
              >
                <Text style={styles.diffButtonText}>선택한 버전 비교</Text>
              </Pressable>
            )}
          </View>

          <FlatList
            data={revisions}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.textMuted }]}>수정 역사가 없습니다.</Text>
            }
            renderItem={({ item, index }) => {
              const isSelected = selected.includes(item.id)
              const isDisabled = !isSelected && selected.length >= 2
              const revNum = revisions.length - index
              return (
                <View
                  style={[
                    styles.row,
                    { borderBottomColor: theme.border },
                    isSelected && { backgroundColor: `${theme.accent}18` },
                  ]}
                >
                  <Pressable
                    hitSlop={8}
                    disabled={isDisabled}
                    onPress={() => toggle(item.id)}
                    style={[
                      styles.checkbox,
                      { borderColor: isDisabled ? theme.border : theme.accent },
                      isSelected && { backgroundColor: theme.accent },
                    ]}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                  <Pressable
                    style={styles.rowBody}
                    onPress={() => router.push({ pathname: '/revision/[id]', params: { id: item.id } })}
                  >
                    <View style={styles.rowTop}>
                      <Text style={[styles.revNum, { color: theme.textMuted }]}>r{revNum}</Text>
                      <Text style={[styles.date, { color: theme.textMuted }]}>
                        {formatDateTime(item.edited_at)}
                      </Text>
                      {index === 0 && (
                        <Text style={[styles.latest, { color: theme.accent }]}>최신</Text>
                      )}
                    </View>
                    <View style={styles.rowBottom}>
                      <Text style={[styles.editor, { color: theme.text }]}>
                        {editorLabel(item.editor_id)}
                      </Text>
                      <BytesDiff diff={item.bytesDiff} mutedColor={theme.textMuted} />
                      {item.comment ? (
                        <Text style={[styles.comment, { color: theme.textMuted }]} numberOfLines={1}>
                          {item.comment}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                </View>
              )
            }}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { marginTop: 32 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  toolbarHint: { fontSize: 12 },
  diffButton: { borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  diffButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  empty: { fontSize: 13, textAlign: 'center', marginTop: 48 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  rowBody: { flex: 1, paddingVertical: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revNum: { fontSize: 12, fontVariant: ['tabular-nums'], width: 28 },
  date: { fontSize: 12 },
  latest: { fontSize: 11, fontWeight: '600', marginLeft: 'auto' },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3, paddingLeft: 36 },
  editor: { fontSize: 13 },
  bytes: { fontSize: 12, fontVariant: ['tabular-nums'] },
  comment: { fontSize: 12, flex: 1 },
})
