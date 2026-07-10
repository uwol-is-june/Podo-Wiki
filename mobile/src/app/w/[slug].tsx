import { Stack, useLocalSearchParams } from 'expo-router'

import { WikiWebView } from '@/components/wiki-webview'

// TASK-043/045에서 Supabase 실데이터 + TOC·브레드크럼으로 교체 예정
const SAMPLE = `렌더러 스파이크 화면입니다. 강조[^1]와 [내부 링크](/w/포도상점) 확인용.

# 첫 단원
본문 내용

## 소단원
| 표 | 확인 |
| --- | --- |
| a | b |

[^1]: 각주 정의.
`

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()

  return (
    <>
      <Stack.Screen options={{ title: slug }} />
      <WikiWebView content={SAMPLE} />
    </>
  )
}
