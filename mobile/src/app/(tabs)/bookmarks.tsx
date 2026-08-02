import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

import { BOTTOM_TAB_INSET, TabScreen } from '@/components/tab-screen'
import { useBookmarks, useRemoveBookmark } from '@/hooks/use-bookmarks'
import { formatDateTime } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

export default function BookmarksScreen() {
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const { bookmarks, isLoading } = useBookmarks()
  const remove = useRemoveBookmark()

  const confirmRemove = (slug: string, title: string) => {
    Alert.alert('북마크 삭제', `"${title}"을(를) 북마크에서 뺄까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => remove(slug) },
    ])
  }

  return (
    <TabScreen title="북마크">
      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={styles.loading} />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.slug}
          contentContainerStyle={{ paddingBottom: BOTTOM_TAB_INSET + 24 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                저장한 문서가 없습니다
              </Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                문서를 열고 오른쪽 위 북마크 버튼을 누르면 여기에 모입니다.
              </Text>
              <Text style={[styles.emptyNote, { color: theme.textMuted }]}>
                북마크는 이 기기에만 저장되며 웹사이트와 공유되지 않아요.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { borderBottomColor: theme.border }]}
              onPress={() => router.push({ pathname: '/w/[slug]', params: { slug: item.slug } })}
              onLongPress={() => confirmRemove(item.slug, item.title)}
            >
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, { color: theme.accentText }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.rowMeta, { color: theme.textMuted }]} numberOfLines={1}>
                  {formatDateTime(item.savedAt)} 저장
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => confirmRemove(item.slug, item.title)}
                style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.5 : 1 }]}
              >
                <Text style={[styles.removeIcon, { color: theme.textMuted }]}>✕</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  loading: { marginTop: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 4 },
  removeIcon: { fontSize: 15 },
  empty: { paddingHorizontal: 32, paddingTop: 64, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyNote: { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },
})
