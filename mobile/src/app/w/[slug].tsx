import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useRef, useState } from 'react'
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

import { TocSheet } from '@/components/toc-sheet'
import { WikiWebView } from '@/components/wiki-webview'
import { formatDateTime, getDocument, getExistingSlugs } from '@/lib/api'
import { FAQ_SLUG } from '@/lib/constants'
import { extractHeadings } from '@/lib/wiki/headings'
import { wikiTheme } from '@/theme/colors'

export default function DocumentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const webviewRef = useRef<WebView>(null)
  const [tocVisible, setTocVisible] = useState(false)

  const { data: document, isLoading } = useQuery({
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

  // 웹과 동일: FAQ 문서는 전용 화면으로
  if (slug === FAQ_SLUG) return <Redirect href="/faq" />

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
          headerRight: () => (
            <View style={styles.headerActions}>
              {headings.length > 0 && (
                <Pressable hitSlop={8} onPress={() => setTocVisible(true)}>
                  <Text style={[styles.headerAction, { color: theme.headerText }]}>목차</Text>
                </Pressable>
              )}
              {document && (
                <Pressable
                  hitSlop={8}
                  onPress={() => router.push({ pathname: '/history/[slug]', params: { slug } })}
                >
                  <Text style={[styles.headerAction, { color: theme.headerText }]}>역사</Text>
                </Pressable>
              )}
            </View>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
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
                    <Text style={[styles.breadcrumbLink, { color: theme.accent }]}>{b.label}</Text>
                  </Pressable>
                  <Text style={[styles.breadcrumbSep, { color: theme.textMuted }]}>›</Text>
                </View>
              ))}
              <Text style={[styles.breadcrumbCurrent, { color: theme.textMuted }]}>
                {segments[segments.length - 1]}
              </Text>
            </ScrollView>
          )}

          <WikiWebView
            ref={webviewRef}
            content={document.content}
            footerText={`최종 수정: ${formatDateTime(document.updated_at)}`}
          />

          <TocSheet
            visible={tocVisible}
            headings={headings}
            onSelect={scrollToHeading}
            onClose={() => setTocVisible(false)}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  headerActions: { flexDirection: 'row', gap: 18 },
  headerAction: { fontSize: 15 },
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
