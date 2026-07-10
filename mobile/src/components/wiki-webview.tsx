import { useRouter } from 'expo-router'
import { forwardRef, useEffect, useState } from 'react'
import { ActivityIndicator, Linking, StyleSheet, View, useColorScheme } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'

import { FAQ_SLUG, SITE_URL } from '@/lib/constants'
import { renderWikiBodyHtml } from '@/lib/markdown/renderHtml'
import { wikiHtmlDocument } from '@/lib/markdown/template'
import { wikiTheme } from '@/theme/colors'

// 문서 본문 마크다운을 로컬 생성 HTML로 렌더링하는 WebView.
// 링크는 전부 가로채서 네이티브 내비게이션으로 처리한다 (원격 페이지 로딩 없음).
export const WikiWebView = forwardRef<WebView, { content: string; footerText?: string }>(
  function WikiWebView({ content, footerText }, ref) {
  const router = useRouter()
  const scheme = useColorScheme()
  const theme = wikiTheme(scheme)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    renderWikiBodyHtml(content).then(body => {
      const footer = footerText
        ? `<p class="doc-meta">${footerText.replace(/</g, '&lt;')}</p>`
        : ''
      if (!cancelled) setHtml(wikiHtmlDocument(body + footer, theme))
    })
    return () => {
      cancelled = true
    }
  }, [content, footerText, theme])

  const handleMessage = (event: WebViewMessageEvent) => {
    let msg: { type?: string; href?: string }
    try {
      msg = JSON.parse(event.nativeEvent.data)
    } catch {
      return
    }
    if (msg.type !== 'link' || !msg.href) return
    const href = msg.href

    if (href.startsWith('/w/')) {
      const slug = decodeURIComponent(href.slice(3))
      if (slug === FAQ_SLUG) router.push('/faq')
      else router.push({ pathname: '/w/[slug]', params: { slug } })
      return
    }
    if (href === '/faq' || href.startsWith('/faq#')) {
      router.push('/faq')
      return
    }
    if (href.startsWith('/history/')) {
      router.push({ pathname: '/history/[slug]', params: { slug: decodeURIComponent(href.slice(9)) } })
      return
    }
    if (href === '/recent') {
      router.push('/recent')
      return
    }
    // 그 외 사이트 상대 경로(로그인·편집 등 앱 미지원 화면)와 외부 링크는 브라우저로
    const url = /^[a-z][a-z\d+\-.]*:/i.test(href) ? href : `${SITE_URL}${href.startsWith('/') ? '' : '/'}${href}`
    Linking.openURL(url).catch(() => {})
  }

  if (html === null) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    )
  }

  return (
    <WebView
      ref={ref}
      source={{ html, baseUrl: SITE_URL }}
      originWhitelist={['*']}
      style={{ backgroundColor: theme.bg }}
      onMessage={handleMessage}
      // 링크는 JS에서 가로채 postMessage로 전달하므로 초기 HTML 로딩 외 내비게이션은 차단
      onShouldStartLoadWithRequest={request => {
        return request.url === 'about:blank' || request.url.startsWith(SITE_URL)
      }}
      setSupportMultipleWindows={false}
      allowsBackForwardNavigationGestures={false}
      decelerationRate="normal"
    />
  )
})

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
