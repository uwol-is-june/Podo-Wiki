import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Heading } from '@/lib/wiki/headings'
import { wikiTheme } from '@/theme/colors'

// 문서 목차 바텀시트. 항목 탭 → 해당 헤딩으로 WebView 스크롤 (부모가 처리)
export function TocSheet({
  visible,
  headings,
  onSelect,
  onClose,
}: {
  visible: boolean
  headings: Heading[]
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const theme = wikiTheme(useColorScheme())
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Text style={[styles.title, { color: theme.textMuted }]}>목차</Text>
        <ScrollView style={styles.list}>
          {headings.map(h => (
            <Pressable
              key={`${h.id}-${h.number}`}
              style={[styles.row, { paddingLeft: 16 + (h.level - 1) * 16 }]}
              onPress={() => {
                onSelect(h.id)
                onClose()
              }}
            >
              <Text style={[styles.number, { color: theme.textMuted }]}>{h.number}.</Text>
              <Text style={[styles.text, { color: theme.accent }]} numberOfLines={1}>
                {h.text}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '70%',
  },
  title: { fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: 6, paddingVertical: 10, paddingRight: 16 },
  number: { fontSize: 14 },
  text: { fontSize: 14, flex: 1 },
})
