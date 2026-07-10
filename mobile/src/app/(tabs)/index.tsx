import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

import { BOTTOM_TAB_INSET, TabScreen } from '@/components/tab-screen'
import { TROUPES } from '@/data/troupes'
import { editorLabel, formatDateTime, getHomeData, getRandomSlug } from '@/lib/api'
import { SITE_URL } from '@/lib/constants'
import { wikiTheme } from '@/theme/colors'

export default function HomeScreen() {
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['home'],
    queryFn: getHomeData,
  })

  const openRandom = async () => {
    const slug = await getRandomSlug()
    if (slug) router.push({ pathname: '/w/[slug]', params: { slug } })
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
          {TROUPES.map(troupe => (
            <Pressable
              key={troupe.slug}
              style={[styles.troupeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push({ pathname: '/w/[slug]', params: { slug: troupe.slug } })}
            >
              {troupe.logo ? (
                <Image
                  source={{ uri: `${SITE_URL}${troupe.logo}` }}
                  style={styles.troupeLogo}
                  contentFit="contain"
                />
              ) : (
                <View style={[styles.troupeInitial, { backgroundColor: theme.accent }]}>
                  <Text style={styles.troupeInitialText}>{troupe.name[0]}</Text>
                </View>
              )}
              <Text style={[styles.troupeName, { color: theme.text }]} numberOfLines={1}>
                {troupe.name}
              </Text>
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
            <Text style={[styles.moreLink, { color: theme.accent }]}>전체 보기</Text>
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
                <Text style={[styles.recentTitle, { color: theme.accent }]} numberOfLines={1}>
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
            <Text style={[styles.moreLink, { color: theme.accent }]}>전체 보기</Text>
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
                <Text style={[styles.faqQ, { color: theme.accent }]}>Q.</Text>
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
  troupeLogo: { width: 44, height: 44, borderRadius: 8 },
  troupeInitial: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  troupeInitialText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  troupeName: { fontSize: 12, paddingHorizontal: 6 },
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
