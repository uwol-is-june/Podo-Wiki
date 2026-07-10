import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

import { ErrorState } from '@/components/error-state'
import { WikiWebView } from '@/components/wiki-webview'
import { editorLabel, formatDateTime, getRevision } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

export default function RevisionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())

  const { data: revision, isLoading, isError, refetch } = useQuery({
    queryKey: ['revision', id],
    queryFn: () => getRevision(id),
  })

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen
        options={{
          title: revision ? `${revision.documents?.title ?? revision.document_slug} — 리비전` : '리비전',
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !revision ? (
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: theme.textMuted }]}>버전을 찾을 수 없습니다.</Text>
        </View>
      ) : (
        <>
          {/* 과거 버전 열람 안내 배너 */}
          <View style={[styles.banner, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.bannerText, { color: theme.textMuted }]}>
              {formatDateTime(revision.edited_at)} · {editorLabel(revision.editor_id)} 버전
              {revision.comment ? ` · ${revision.comment}` : ''}
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                router.push({ pathname: '/w/[slug]', params: { slug: revision.document_slug } })
              }
            >
              <Text style={[styles.bannerLink, { color: theme.accent }]}>현재 문서</Text>
            </Pressable>
          </View>

          <WikiWebView content={revision.content} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 14 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bannerText: { fontSize: 12, flex: 1 },
  bannerLink: { fontSize: 13, fontWeight: '600' },
})
