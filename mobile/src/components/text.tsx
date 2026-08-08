import { Children } from 'react'
import { Platform, Text as RNText, type TextProps } from 'react-native'

/**
 * 한글 줄바꿈을 어절 단위로 맞춘 Text (TASK-080).
 *
 * 기본 줄바꿈 규칙에서 한글은 글자 단위로 끊겨서, "극예술연구회 시네씨아"가
 * "극예술연구회 시네 / 씨아"처럼 어절 중간에서 갈라진다.
 *
 * - iOS: `lineBreakStrategyIOS="hangul-word"`로 OS가 어절 단위로 끊어준다
 * - Android: **OS 설정으로는 안 된다.** 이걸 하는 건 `android:lineBreakWordStyle="phrase"`
 *   (API 33+)인데 RN 0.86 Text에는 이 prop이 없다. `textBreakStrategy`는 어느 값을 줘도
 *   한글은 글자 단위로 끊긴다(에뮬레이터에서 확인). 그래서 아래 `joinHangul`로
 *   한글 글자 사이에 U+2060(WORD JOINER)을 끼워 넣어 어절 안쪽에서 못 끊게 만든다
 *
 * 웹의 `globals.css` body `word-break: keep-all`과 같은 정책이다. 한쪽만 고치면 어긋나니 주의.
 *
 * RN의 Text 대신 이걸 쓸 것. props로 넘기면 개별 화면에서 덮어쓸 수 있다.
 */

// 한글 음절 + 자모. 한글끼리 붙어 있을 때만 이어 붙여서, 영문·URL·경로(`문서/하위`)의
// 기존 줄바꿈 지점은 건드리지 않는다
const HANGUL = /[가-힣ᄀ-ᇿ㄰-㆏]/
const WORD_JOINER = '\u2060' // 눈에 안 보이는 문자라 이스케이프로 적는다

// 한 어절이 칸보다 길면 아예 못 끊어서 넘쳐버리므로, 지나치게 긴 덩어리는 원래대로 둔다
const MAX_JOINED_TOKEN = 20

function joinToken(token: string): string {
  if (token.length > MAX_JOINED_TOKEN) return token
  let out = ''
  for (let i = 0; i < token.length; i++) {
    out += token[i]
    if (i + 1 < token.length && HANGUL.test(token[i]) && HANGUL.test(token[i + 1])) {
      out += WORD_JOINER
    }
  }
  return out
}

function joinHangul(text: string): string {
  if (!HANGUL.test(text)) return text
  // 공백은 그대로 남겨서 어절 사이에서는 계속 끊길 수 있게 한다
  return text.split(/(\s+)/).map(part => (/\s/.test(part) ? part : joinToken(part))).join('')
}

// 문자열 children 만 손본다. 중첩된 <Text>는 그 자신이 이 컴포넌트라 알아서 처리됨
function transform(children: TextProps['children']): TextProps['children'] {
  if (typeof children === 'string') return joinHangul(children)
  if (Array.isArray(children)) {
    return Children.map(children, child => (typeof child === 'string' ? joinHangul(child) : child))
  }
  return children
}

export function Text({
  lineBreakStrategyIOS = 'hangul-word',
  textBreakStrategy = 'highQuality',
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      lineBreakStrategyIOS={lineBreakStrategyIOS}
      textBreakStrategy={textBreakStrategy}
      {...props}
    >
      {Platform.OS === 'android' ? transform(children) : children}
    </RNText>
  )
}
