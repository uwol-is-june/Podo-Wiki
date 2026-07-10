import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native'

import { BOTTOM_TAB_INSET, TabScreen } from '@/components/tab-screen'
import { PAGE_SIZE, editorLabel, formatDateTime, getRecentRevisions } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

export default function RecentScreen() {
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useInfiniteQuery({
      queryKey: ['recent'],
      queryFn: ({ pageParam }) => getRecentRevisions(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) =>
        pages.length * PAGE_SIZE < lastPage.count ? pages.length + 1 : undefined,
    })

  const rows = data?.pages.flatMap(page => page.rows) ?? []

  return (
    <TabScreen title="최근 변경">
      {isLoading ? (
        <ActivityIndicator color={theme.accent} style={styles.loading} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: BOTTOM_TAB_INSET + 24 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textMuted }]}>아직 수정된 문서가 없습니다.</Text>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={theme.accent} style={styles.footerLoading} />
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { borderBottomColor: theme.border }]}
              onPress={() =>
                router.push({ pathname: '/w/[slug]', params: { slug: item.document_slug } })
              }
            >
              <Text style={[styles.rowTitle, { color: theme.accent }]} numberOfLines={1}>
                {item.documents?.title ?? item.document_slug}
              </Text>
              <Text style={[styles.rowMeta, { color: theme.textMuted }]}>
                {formatDateTime(item.edited_at)} · {editorLabel(item.editor_id)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  loading: { marginTop: 32 },
  empty: { fontSize: 13, textAlign: 'center', marginTop: 48 },
  footerLoading: { paddingVertical: 16 },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowMeta: { fontSize: 12, marginTop: 3 },
})
