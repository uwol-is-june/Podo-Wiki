import { Text as RNText, type TextProps } from 'react-native'

/**
 * 한글 줄바꿈을 어절 단위로 맞춘 Text (TASK-080).
 *
 * 기본 줄바꿈 규칙에서 한글은 글자 단위로 끊겨서, "극예술연구회 시네씨아"가
 * "극예술연구 / 회 시네씨아"처럼 어절 중간에서 갈라진다.
 * - iOS: `hangul-word`로 한글 어절 단위 줄바꿈
 * - Android: `highQuality`가 기본값이지만, 정책을 한곳에 모아두려고 명시
 *
 * 웹의 `globals.css` body `word-break: keep-all`과 같은 정책이다. 한쪽만 고치면 어긋나니 주의.
 *
 * RN의 Text 대신 이걸 쓸 것. props로 넘기면 개별 화면에서 덮어쓸 수 있다.
 */
export function Text({
  lineBreakStrategyIOS = 'hangul-word',
  textBreakStrategy = 'highQuality',
  ...props
}: TextProps) {
  return (
    <RNText
      lineBreakStrategyIOS={lineBreakStrategyIOS}
      textBreakStrategy={textBreakStrategy}
      {...props}
    />
  )
}
