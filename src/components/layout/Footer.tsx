const APP_STORE_URL = 'https://apps.apple.com/kr/app/id6790099095'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.podowiki.app'

export default function Footer() {
  return (
    <footer className="border-t border-wiki-border bg-wiki-surface py-4 text-center text-sm text-wiki-text-muted">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <a href={APP_STORE_URL} target="_blank" rel="noreferrer" aria-label="App Store에서 포도위키 다운로드">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badges/app-store-badge-ko.svg" alt="App Store에서 다운로드" className="h-10 w-auto" />
          </a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" aria-label="Google Play에서 포도위키 다운로드">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badges/google-play-badge-ko.png" alt="Google Play에서 다운로드" className="h-[60px] w-auto" />
          </a>
        </div>
        <p>
          © 2025 포도위키
          <span className="mx-2">·</span>
          별도 명시가 없는 한{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/2.0/kr/"
            target="_blank"
            rel="noreferrer"
            className="text-wiki-accent hover:underline whitespace-nowrap"
          >
            CC BY-NC-SA 2.0 KR
          </a>
          <span className="mx-2">·</span>
          문의:{' '}
          <a
            href="mailto:podo@podo-store.com"
            className="text-wiki-accent hover:underline whitespace-nowrap"
          >
            podo@podo-store.com
          </a>
        </p>
      </div>
    </footer>
  )
}
