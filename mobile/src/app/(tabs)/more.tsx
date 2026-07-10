import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

import { BOTTOM_TAB_INSET, TabScreen } from '@/components/tab-screen'
import { getRandomSlug } from '@/lib/api'
import { CONTACT_EMAIL, SITE_URL } from '@/lib/constants'
import { wikiTheme } from '@/theme/colors'

export default function MoreScreen() {
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const [randomLoading, setRandomLoading] = useState(false)

  const openRandom = async () => {
    if (randomLoading) return
    setRandomLoading(true)
    try {
      const slug = await getRandomSlug()
      if (slug) router.push({ pathname: '/w/[slug]', params: { slug } })
    } finally {
      setRandomLoading(false)
    }
  }

  // 애플 UGC(1.2) 가이드라인 대응: 콘텐츠 신고 창구 제공
  const reportDocument = () => {
    const subject = encodeURIComponent('[포도위키] 문서 신고/문의')
    const body = encodeURIComponent('문서 주소 또는 제목:\n\n신고/문의 내용:\n')
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {})
  }

  const rows: { label: string; sub?: string; onPress: () => void }[] = [
    { label: '자주 묻는 질문', onPress: () => router.push('/faq') },
    { label: '랜덤 문서', sub: '아무 문서나 열어보기', onPress: openRandom },
    { label: '포도위키 웹사이트', sub: '문서 편집은 웹에서 (회원 전용)', onPress: () => Linking.openURL(SITE_URL).catch(() => {}) },
    { label: '문서 신고 / 문의', sub: CONTACT_EMAIL, onPress: reportDocument },
    { label: '개인정보처리방침', onPress: () => Linking.openURL(`${SITE_URL}/privacy`).catch(() => {}) },
  ]

  return (
    <TabScreen title="더보기">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: BOTTOM_TAB_INSET + 24 }}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {rows.map((row, i) => (
            <Pressable
              key={row.label}
              style={[
                styles.row,
                i < rows.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={row.onPress}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>{row.label}</Text>
                {row.sub && (
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>{row.sub}</Text>
                )}
              </View>
              <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.appInfo, { color: theme.textMuted }]}>
          포도위키 {Constants.expoConfig?.version ?? ''} · 공연단체 인수인계 위키{'\n'}
          읽기 전용 앱 — 문서 열람에 로그인이 필요 없어요.
        </Text>
      </ScrollView>
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 20, marginLeft: 8 },
  appInfo: { fontSize: 12, textAlign: 'center', marginTop: 20, lineHeight: 18 },
})
