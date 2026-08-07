import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native'

import { ErrorState } from '@/components/error-state'
import { BOTTOM_TAB_INSET, TabScreen } from '@/components/tab-screen'
import { Text } from '@/components/text'
import { editorLabel, formatDateTime, getHomeData, getRandomSlug, troupeLogoUri } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

export default function HomeScreen() {
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['home'],
    queryFn: getHomeData,
  })

  const openRandom = async () => {
    const slug = await getRandomSlug()
    if (slug) router.push({ pathname: '/w/[slug]', params: { slug } })
  }

  if (isError) {
    return (
      <TabScreen title="포도위키">
        <ErrorState onRetry={refetch} />
      </TabScreen>
    )
  }

  return (
    <TabScreen title="포도위키">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: BOTTOM_TAB_INSET + 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />
        }
      >
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          공연단체 인수인계 위키{data ? ` · 총 문서 ${data.docCount}개` : ''}
        </Text>

        {/* 공연단체 바로가기 */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>공연단체</Text>
        <View style={styles.troupeGrid}>
          {/* 단체 목록은 웹 /admin 에서 등록 (TASK-075) — 로딩 중이면 랜덤 문서 카드만 먼저 보인다 */}
          {(data?.troupes ?? []).map(troupe => (
            <Pressable
              key={troupe.slug}
              style={[styles.troupeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/w/[slug]', params: { slug: troupe.slug } })}
            >
              {troupeLogoUri(troupe.logo_url) ? (
                <Image
                  source={{ uri: troupeLogoUri(troupe.logo_url)! }}
                  style={styles.troupeLogo}
                  contentFit="contain"
                />
              ) : (
                <View style={[styles.troupeInitial, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.troupeInitialText, { color: theme.onAccent }]}>
                    {troupe.name[0]}
                  </Text>
                </View>
              )}
              {/* 소속 + 명칭 2줄 표기 (소속이 없으면 명칭 한 줄) */}
              <View style={styles.troupeLabel}>
                {troupe.affiliation ? (
                  <Text
                    style={[styles.troupeAffiliation, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {troupe.affiliation}
                  </Text>
                ) : null}
                <Text style={[styles.troupeName, { color: theme.text }]} numberOfLines={2}>
                  {troupe.name}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={[styles.troupeCard, { borderColor: theme.border }]} onPress={openRandom}>
            <View style={[styles.troupeInitial, { backgroundColor: theme.border }]}>
              <Text style={[styles.troupeInitialText, { color: theme.textMuted }]}>?</Text>
            </View>
            <Text style={[styles.troupeName, { color: theme.textMuted }]}>랜덤 문서</Text>
          </Pressable>
        </View>

        {/* 최근 변경 */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>최근 변경</Text>
          <Pressable onPress={() => router.push('/recent')}>
            <Text style={[styles.moreLink, { color: theme.accentText }]}>전체 보기</Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {isLoading ? (
            <ActivityIndicator color={theme.accent} style={styles.cardLoading} />
          ) : !data || data.recent.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>아직 수정된 문서가 없습니다.</Text>
          ) : (
            data.recent.map((rev, i) => (
              <Pressable
                key={rev.id}
                style={[
                  styles.recentRow,
                  i < data.recent.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                ]}
                onPress={() =>
                  router.push({ pathname: '/w/[slug]', params: { slug: rev.document_slug } })
                }
              >
                <Text style={[styles.recentTitle, { color: theme.accentText }]} numberOfLines={1}>
                  {rev.documents?.title ?? rev.document_slug}
                </Text>
                <Text style={[styles.recentMeta, { color: theme.textMuted }]}>
                  {formatDateTime(rev.edited_at)} · {editorLabel(rev.editor_id)}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* FAQ 프리뷰 */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>자주 묻는 질문</Text>
          <Pressable onPress={() => router.push('/faq')}>
            <Text style={[styles.moreLink, { color: theme.accentText }]}>전체 보기</Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {isLoading ? (
            <ActivityIndicator color={theme.accent} style={styles.cardLoading} />
          ) : !data || data.faqPreview.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>아직 등록된 질문이 없습니다.</Text>
          ) : (
            data.faqPreview.map((item, i) => (
              <Pressable
                key={item.id}
                style={[
                  styles.faqRow,
                  i < data.faqPreview.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                ]}
                onPress={() => router.push('/faq')}
              >
                <Text style={[styles.faqQ, { color: theme.accentText }]}>Q.</Text>
                <Text style={[styles.faqText, { color: theme.text }]} numberOfLines={2}>
                  {item.question}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 13, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginTop: 8, marginBottom: 10 },
  moreLink: { fontSize: 13 },
  troupeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  troupeCard: {
    width: '30%',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  troupeLogo: { width: 68, height: 68, borderRadius: 10 },
  troupeInitial: {
    width: 68,
    height: 68,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  troupeInitialText: { fontSize: 26, fontWeight: '700' },
  troupeLabel: { alignItems: 'center', gap: 1, paddingHorizontal: 6 },
  troupeAffiliation: { fontSize: 10 },
  troupeName: { fontSize: 12.5, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 10, marginBottom: 16, overflow: 'hidden' },
  cardLoading: { paddingVertical: 24 },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  recentRow: { paddingHorizontal: 14, paddingVertical: 11 },
  recentTitle: { fontSize: 14, fontWeight: '500' },
  recentMeta: { fontSize: 12, marginTop: 2 },
  faqRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  faqQ: { fontSize: 14, fontWeight: '700' },
  faqText: { fontSize: 14, flex: 1 },
})
