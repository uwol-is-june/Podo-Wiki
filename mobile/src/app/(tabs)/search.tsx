import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native'

import { ErrorState } from '@/components/error-state'
import { BOTTOM_TAB_INSET, TabScreen } from '@/components/tab-screen'
import { searchDocuments, suggestDocuments } from '@/lib/api'
import { wikiTheme } from '@/theme/colors'

export default function SearchScreen() {
  const router = useRouter()
  const theme = wikiTheme(useColorScheme())
  const [input, setInput] = useState('')
  const [debounced, setDebounced] = useState('')
  const [submitted, setSubmitted] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), 300)
    return () => clearTimeout(t)
  }, [input])

  // 입력 중: 제목/슬러그 서제스트 (웹 헤더 검색창과 동일)
  const { data: suggestions } = useQuery({
    queryKey: ['suggest', debounced],
    queryFn: () => suggestDocuments(debounced),
    enabled: debounced.length > 0 && submitted !== debounced,
  })

  // 제출: 본문 포함 전체 검색 (웹 /search와 동일)
  const { data: results, isFetching, isError, refetch } = useQuery({
    queryKey: ['search', submitted],
    queryFn: () => searchDocuments(submitted),
    enabled: submitted.length > 0,
  })

  const openDocument = (slug: string) =>
    router.push({ pathname: '/w/[slug]', params: { slug } })

  const showSuggestions = submitted !== debounced && (suggestions?.length ?? 0) > 0

  return (
    <TabScreen title="검색">
      <View style={styles.inputWrap}>
        <TextInput
          value={input}
          onChangeText={text => {
            setInput(text)
            if (submitted && text.trim() !== submitted) setSubmitted('')
          }}
          onSubmitEditing={() => setSubmitted(input.trim())}
          placeholder="문서 제목·내용 검색"
          placeholderTextColor={theme.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          style={[
            styles.input,
            { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          ]}
        />
      </View>

      {showSuggestions ? (
        <FlatList
          data={suggestions}
          keyExtractor={item => item.slug}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: BOTTOM_TAB_INSET + 24 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.suggestRow, { borderBottomColor: theme.border }]}
              onPress={() => openDocument(item.slug)}
            >
              <Text style={[styles.suggestTitle, { color: theme.text }]}>{item.title}</Text>
              {item.slug !== item.title && (
                <Text style={[styles.suggestSlug, { color: theme.textMuted }]} numberOfLines={1}>
                  {item.slug}
                </Text>
              )}
            </Pressable>
          )}
        />
      ) : submitted ? (
        isFetching ? (
          <ActivityIndicator color={theme.accent} style={styles.loading} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <FlatList
            data={results ?? []}
            keyExtractor={item => item.slug}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: BOTTOM_TAB_INSET + 24, gap: 10 }}
            ListHeaderComponent={
              <Text style={[styles.resultCount, { color: theme.textMuted }]}>
                {(results?.length ?? 0) > 0
                  ? `${results!.length}개의 문서를 찾았습니다.`
                  : `"${submitted}"와 일치하는 문서가 없습니다.`}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => openDocument(item.slug)}
              >
                <Text style={[styles.resultTitle, { color: theme.accent }]}>{item.title}</Text>
                <Text style={[styles.resultSnippet, { color: theme.textMuted }]} numberOfLines={2}>
                  {item.snippet}
                </Text>
              </Pressable>
            )}
          />
        )
      ) : (
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          검색어를 입력하면 문서 제목·내용에서 찾아드려요.
        </Text>
      )}
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  inputWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  suggestRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  suggestTitle: { fontSize: 15, fontWeight: '500' },
  suggestSlug: { fontSize: 12, marginTop: 2 },
  loading: { marginTop: 32 },
  resultCount: { fontSize: 13, marginBottom: 4 },
  resultCard: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  resultTitle: { fontSize: 15, fontWeight: '600' },
  resultSnippet: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 40, paddingHorizontal: 32 },
})
