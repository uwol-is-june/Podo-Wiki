import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'
import type WebView from 'react-native-webview'

import { ErrorState } from '@/components/error-state'
import { ScrollTopFab } from '@/components/scroll-top-fab'
import { TocBar } from '@/components/toc-bar'
import { WikiWebView } from '@/components/wiki-webview'
import { useBookmarkToggle, useSyncBookmarkTitle } from '@/hooks/use-bookmarks'
import { formatDateTime, getDocument, getExistingSlugs } from '@/lib/api'
import { FAQ_SLUG } from '@/lib/constants'
import { extractHeadings } from '@/lib/wiki/headings'
import { wikiTheme } from '@/theme/colors'

export default function DocumentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const webviewRef = useRef<WebView>(null)
  // 본문을 이 정도 내렸을 때부터 '맨 위로' 버튼을 띄운다 (화면 절반 남짓)
  const [showTopFab, setShowTopFab] = useState(false)

  const { data: document, isLoading, isError, refetch } = useQuery({
    queryKey: ['document', slug],
    queryFn: () => getDocument(slug),
    enabled: slug !== FAQ_SLUG,
  })

  // 브레드크럼: 상위 경로 중 실제로 존재하는 문서만 (웹 w/[...slug]와 동일)
  const segments = useMemo(() => slug.split('/'), [slug])
  const parentSlugs = useMemo(
    () => segments.slice(0, -1).map((_, i) => segments.slice(0, i + 1).join('/')),
    [segments]
  )
  const { data: existingSlugs } = useQuery({
    queryKey: ['existing-slugs', parentSlugs],
    queryFn: () => getExistingSlugs(parentSlugs),
    enabled: parentSlugs.length > 0,
  })
  const breadcrumbs = parentSlugs
    .map((s, i) => ({ slug: s, label: segments[i] }))
    .filter(b => existingSlugs?.has(b.slug))

  const headings = useMemo(
    () => (document ? extractHeadings(document.content) : []),
    [document]
  )

  const { isBookmarked, toggle: toggleBookmark } = useBookmarkToggle(slug, document?.title)

  // 저장해둔 문서를 다시 열었을 때 그 사이 바뀐 제목을 북마크 목록에도 반영
  const syncBookmarkTitle = useSyncBookmarkTitle()
  useEffect(() => {
    if (document?.title) void syncBookmarkTitle(slug, document.title)
  }, [document?.title, slug, syncBookmarkTitle])

  // 웹과 동일: FAQ 문서는 전용 화면으로
  if (slug === FAQ_SLUG) return <Redirect href="/faq" />

  const scrollToTop = () => {
    webviewRef.current?.injectJavaScript(`window.scrollTo({top:0,behavior:'smooth'}); true;`)
    setShowTopFab(false)
  }

  const scrollToHeading = (id: string) => {
    webviewRef.current?.injectJavaScript(
      `document.getElementById(${JSON.stringify(id)})?.scrollIntoView({behavior:'smooth'}); true;`
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen
        options={{
          title: document?.title ?? slug,
          headerTitleStyle: { fontSize: 16 },
          headerRight: () =>
            document ? (
              <Pressable
                hitSlop={10}
                onPress={() => toggleBookmark()}
                accessibilityRole="button"
                accessibilityLabel={isBookmarked ? '북마크 해제' : '북마크에 저장'}
                accessibilityState={{ selected: isBookmarked }}
                style={({ pressed }) => [styles.headerIcon, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.headerIconText, { color: theme.headerText }]}>
                  {isBookmarked ? '★' : '☆'}
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !document ? (
        <View style={styles.center}>
          <View style={[styles.notFoundCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.notFoundTitle, { color: theme.text }]}>{slug}</Text>
            <Text style={[styles.notFoundText, { color: theme.textMuted }]}>
              이 문서는 아직 없습니다.
            </Text>
            <Text style={[styles.notFoundSub, { color: theme.textMuted }]}>
              문서 작성은 포도위키 웹사이트에서 승인된 회원만 할 수 있어요.
            </Text>
          </View>
        </View>
      ) : (
        <>
          {breadcrumbs.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.breadcrumb, { borderBottomColor: theme.border }]}
              contentContainerStyle={styles.breadcrumbContent}
            >
              {breadcrumbs.map(b => (
                <View key={b.slug} style={styles.breadcrumbItem}>
                  <Pressable
                    hitSlop={6}
                    onPress={() => router.push({ pathname: '/w/[slug]', params: { slug: b.slug } })}
                  >
                    <Text style={[styles.breadcrumbLink, { color: theme.accentText }]}>{b.label}</Text>
                  </Pressable>
                  <Text style={[styles.breadcrumbSep, { color: theme.textMuted }]}>›</Text>
                </View>
              ))}
              <Text style={[styles.breadcrumbCurrent, { color: theme.textMuted }]}>
                {segments[segments.length - 1]}
              </Text>
            </ScrollView>
          )}

          <TocBar headings={headings} onSelect={scrollToHeading} />

          <WikiWebView
            ref={webviewRef}
            content={document.content}
            footerText={`최종 수정: ${formatDateTime(document.updated_at)}`}
            onScrollY={y => setShowTopFab(y > 400)}
          />

          <ScrollTopFab visible={showTopFab} onPress={scrollToTop} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  headerIcon: { paddingHorizontal: 4, paddingVertical: 2 },
  headerIconText: { fontSize: 20, lineHeight: 24 },
  notFoundCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  notFoundTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  notFoundText: { fontSize: 14, marginBottom: 4 },
  notFoundSub: { fontSize: 12, textAlign: 'center' },
  breadcrumb: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  breadcrumbContent: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center' },
  breadcrumbLink: { fontSize: 13 },
  breadcrumbSep: { fontSize: 13, marginHorizontal: 6 },
  breadcrumbCurrent: { fontSize: 13 },
})
