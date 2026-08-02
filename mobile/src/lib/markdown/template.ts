// WebView에 로딩할 완전한 HTML 문서 셸.
// CSS는 웹 MarkdownContent.tsx의 PROSE 규칙을 평문 CSS로 옮긴 것 — 구조·색은 keep in sync.
// 단, 글자 크기는 웹보다 한 단계 작다(TASK-067): 앱은 주변 네이티브 UI가 13px대라
// 웹과 같은 16px 본문이 유독 커 보였음. 색 토큰은 accent(배경용)와 accent-text(글자용)를 구분해서 쓸 것.
import type { WikiTheme } from '@/theme/colors'

export function wikiHtmlDocument(bodyHtml: string, theme: WikiTheme): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
:root {
  --bg: ${theme.bg};
  --surface: ${theme.surface};
  --text: ${theme.text};
  --text-muted: ${theme.textMuted};
  --accent: ${theme.accent};
  --accent-text: ${theme.accentText};
  --border: ${theme.border};
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  padding: 14px 14px 36px;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', Roboto, sans-serif;
  font-size: 15px;
  line-height: 1.65;
  word-break: keep-all;
  overflow-wrap: break-word;
}
h1, h2, h3 { scroll-margin-top: 12px; }
h1 {
  font-size: 19px; font-weight: 700; margin: 18px 0 10px; padding-bottom: 7px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
}
h2 {
  font-size: 17px; font-weight: 700; margin: 15px 0 7px; padding-bottom: 4px;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  display: flex; align-items: center; gap: 8px;
}
h3 { font-size: 15px; font-weight: 600; margin: 11px 0 4px; }
h1.collapsible, h2.collapsible { cursor: pointer; -webkit-user-select: none; user-select: none; }
.h-text { flex: 1; }
.hnum { color: var(--text-muted); margin-right: 6px; }
.caret { flex-shrink: 0; color: var(--text-muted); transition: transform .2s; transform: rotate(90deg); }
section.closed > .sec-body { display: none; }
section.closed .caret { transform: rotate(0deg); }
p { margin: 8px 0; }
a { color: var(--accent-text); text-decoration: none; }
ul { list-style: disc; padding-left: 20px; margin: 11px 0; }
ul ul { list-style: circle; } ul ul ul { list-style: square; } ul ul ul ul { list-style: disc; }
ol { list-style: decimal; padding-left: 20px; margin: 11px 0; }
ol ol { list-style: lower-alpha; } ol ol ol { list-style: lower-roman; } ol ol ol ol { list-style: decimal; }
li { margin: 4px 0; }
code {
  background: color-mix(in srgb, var(--border) 30%, transparent);
  padding: 2px 4px; border-radius: 4px;
  font-family: ui-monospace, Menlo, monospace; font-size: 13px;
}
pre {
  background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 16px; margin: 16px 0; white-space: pre-wrap; word-break: break-word;
}
pre code { background: transparent; padding: 0; }
blockquote {
  border-left: 4px solid var(--accent); padding-left: 16px; margin: 16px 0;
  color: var(--text-muted);
}
table { width: 100%; border-collapse: collapse; margin: 14px 0; display: block; overflow-x: auto; font-size: 14px; }
th {
  border: 1px solid var(--border); background: color-mix(in srgb, var(--border) 20%, transparent);
  padding: 6px 9px; text-align: left; font-weight: 600;
}
td { border: 1px solid var(--border); padding: 6px 9px; }
hr { border: 0; border-top: 1px solid var(--border); margin: 24px 0; }
img { max-width: 100%; border-radius: 4px; margin: 12px 0; }
sup { font-size: 12px; line-height: 0; }
.footnote-ref { color: var(--accent-text); }
.doc-meta { margin-top: 24px; font-size: 12px; color: var(--text-muted); }
.faq-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  margin-bottom: 12px; overflow: hidden;
}
.faq-card summary {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; cursor: pointer; -webkit-user-select: none; user-select: none;
  list-style: none;
}
.faq-card summary::-webkit-details-marker { display: none; }
.faq-q { color: var(--accent-text); font-weight: 700; }
.faq-question { font-size: 14px; font-weight: 500; flex: 1; }
.faq-answer {
  padding: 4px 16px 14px;
  border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  font-size: 14px;
}
.footnotes { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
.footnotes ol { list-style: none; padding: 0; margin: 0; font-size: 14px; color: var(--text-muted); }
.fn-item { display: flex; gap: 6px; margin: 4px 0; }
.fn-back { flex-shrink: 0; }
.fn-def p { display: inline; margin: 0; }
#fn-tip {
  position: absolute; z-index: 50; max-width: 260px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
  padding: 8px 12px; font-size: 13px; color: var(--text); line-height: 1.6;
}
#fn-tip p { display: inline; margin: 0; }
</style>
</head>
<body>
${bodyHtml}
<script>
(function () {
  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  // h1/h2 섹션 접기/펴기 (웹 CollapsibleH1/H2의 상태 토글 대응)
  document.querySelectorAll('.collapsible').forEach(function (h) {
    h.addEventListener('click', function () {
      h.parentElement.classList.toggle('closed');
    });
  });

  // 각주 탭 툴팁 (웹은 hover, 모바일은 탭 토글)
  var tip = null;
  function hideTip() { if (tip) { tip.remove(); tip = null; } }
  function showTip(ref) {
    hideTip();
    var label = (ref.getAttribute('href') || '').replace('#fn-', '');
    var def = document.getElementById('fn-' + label);
    var content = def && def.querySelector('.fn-def');
    if (!content) return;
    tip = document.createElement('div');
    tip.id = 'fn-tip';
    tip.innerHTML = content.innerHTML;
    document.body.appendChild(tip);
    var r = ref.getBoundingClientRect();
    var top = r.top + window.scrollY - tip.offsetHeight - 6;
    if (top < window.scrollY) top = r.bottom + window.scrollY + 6;
    var left = Math.min(r.left + window.scrollX, document.documentElement.clientWidth - tip.offsetWidth - 8);
    tip.style.top = top + 'px';
    tip.style.left = Math.max(8, left) + 'px';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) { hideTip(); return; }
    var href = a.getAttribute('href') || '';

    if (a.classList.contains('footnote-ref')) {
      e.preventDefault();
      if (tip) hideTip(); else showTip(a);
      return;
    }
    hideTip();

    if (href.charAt(0) === '#') {
      e.preventDefault();
      var el = document.getElementById(decodeURIComponent(href.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    e.preventDefault();
    post({ type: 'link', href: href });
  }, true);
})();
</script>
</body>
</html>`
}
