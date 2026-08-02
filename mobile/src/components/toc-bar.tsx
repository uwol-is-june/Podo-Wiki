import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native'

import type { Heading } from '@/lib/wiki/headings'
import { wikiTheme } from '@/theme/colors'

// 펼침/접힘에 LayoutAnimation을 쓰지 않는다 — 이 앱은 신아키텍처(Fabric)라 지원되지 않음.

type Props = {
  headings: Heading[]
  onSelect: (id: string) => void
}

// 본문 상단에 붙는 접이식 목차. 웹이 모바일에서 쓰는 TableOfContents(variant="mobile")와 같은 방식으로,
// 헤더 자리를 북마크에 내주고 목차는 본문 흐름 안에 둔다.
export function TocBar({ headings, onSelect }: Props) {
  const theme = wikiTheme(useColorScheme())
  const [open, setOpen] = useState(false)

  if (headings.length === 0) return null

  const select = (id: string) => {
    setOpen(false)
    onSelect(id)
  }

  return (
    <View style={[styles.wrap, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
      <Pressable
        onPress={() => setOpen(v => !v)}
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.6 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text style={[styles.title, { color: theme.text }]}>목차</Text>
        <Text style={[styles.count, { color: theme.textMuted }]}>{headings.length}</Text>
        <View style={styles.spacer} />
        <Text style={[styles.chevron, { color: theme.textMuted }]}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>

      {open && (
        <ScrollView style={styles.list} nestedScrollEnabled>
          {headings.map(h => (
            <Pressable
              key={`${h.id}-${h.number}`}
              onPress={() => select(h.id)}
              style={({ pressed }) => [
                styles.item,
                { paddingLeft: 16 + (h.level - 1) * 16, opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.itemNumber, { color: theme.textMuted }]}>{h.number}.</Text>
              <Text style={[styles.itemText, { color: theme.accentText }]} numberOfLines={1}>
                {h.text}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: { fontSize: 13, fontWeight: '600' },
  count: { fontSize: 12 },
  spacer: { flex: 1 },
  chevron: { fontSize: 14, fontWeight: '700' },
  list: { maxHeight: 240 },
  item: { flexDirection: 'row', gap: 6, paddingRight: 16, paddingVertical: 8 },
  itemNumber: { fontSize: 13 },
  itemText: { fontSize: 13, flex: 1 },
})
