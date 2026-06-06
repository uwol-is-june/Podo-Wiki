export default function Footer() {
  return (
    <footer className="border-t border-wiki-border bg-wiki-surface py-4 text-center text-sm text-wiki-text-muted">
      <div className="max-w-[1200px] mx-auto px-4">
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
        </p>
      </div>
    </footer>
  )
}
