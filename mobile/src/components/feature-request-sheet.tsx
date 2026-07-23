import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { supabase } from '@/lib/supabase'
import { wikiTheme } from '@/theme/colors'

const MIN_LEN = 5
const MAX_LEN = 2000

// 기능 추가 요청 바텀시트 (비로그인 익명 제출). 더보기 탭에서 사용.
export function FeatureRequestSheet({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const theme = wikiTheme(useColorScheme())
  const insets = useSafeAreaInsets()
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState('')

  const trimmed = content.trim()
  const canSubmit = trimmed.length >= MIN_LEN && trimmed.length <= MAX_LEN && status !== 'submitting'

  const close = () => {
    onClose()
    // 닫힌 뒤 상태 초기화 (애니메이션 후)
    setTimeout(() => {
      setContent('')
      setStatus('idle')
      setError('')
    }, 250)
  }

  const submit = async () => {
    if (!canSubmit) return
    setStatus('submitting')
    setError('')
    const { error: insertError } = await supabase
      .from('feature_requests')
      .insert({ content: trimmed, source: 'app' })
    if (insertError) {
      setError('제출에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setStatus('idle')
      return
    }
    setStatus('done')
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {status === 'done' ? (
            <View style={styles.doneBox}>
              <Text style={[styles.doneTitle, { color: theme.text }]}>요청이 접수되었습니다 🙌</Text>
              <Text style={[styles.doneSub, { color: theme.textMuted }]}>
                소중한 의견 감사합니다. 검토 후 반영하겠습니다.
              </Text>
              <Pressable
                style={[styles.submitBtn, { backgroundColor: theme.accent }]}
                onPress={close}
              >
                <Text style={styles.submitText}>닫기</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.text }]}>기능 추가 요청</Text>
              <Text style={[styles.desc, { color: theme.textMuted }]}>
                추가되었으면 하는 기능이나 개선 아이디어를 자유롭게 남겨주세요. (익명)
              </Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                maxLength={MAX_LEN}
                multiline
                editable={status !== 'submitting'}
                placeholder="예: 문서에 즐겨찾기 기능이 있으면 좋겠어요."
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg },
                ]}
              />
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: error ? '#dc2626' : theme.textMuted }]}>
                  {error || `${trimmed.length} / ${MAX_LEN}`}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.cancelBtn, { borderColor: theme.border }]}
                  onPress={close}
                >
                  <Text style={[styles.cancelText, { color: theme.textMuted }]}>취소</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.submitBtn,
                    { backgroundColor: theme.accent, opacity: canSubmit ? 1 : 0.5 },
                  ]}
                  onPress={submit}
                  disabled={!canSubmit}
                >
                  {status === 'submitting' ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitText}>제출</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  kav: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  desc: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  metaRow: { marginTop: 6, minHeight: 16 },
  meta: { fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, borderWidth: 1 },
  cancelText: { fontSize: 15 },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  doneBox: { alignItems: 'center', paddingVertical: 16 },
  doneTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  doneSub: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
})
