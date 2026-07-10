import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침 — 포도위키',
}

const CONTACT_EMAIL = 'podostore1111@gmail.com'

const SECTION_TITLE = 'text-lg font-semibold text-wiki-text mt-8 mb-3'
const BODY = 'text-sm text-wiki-text leading-relaxed'
const LIST = 'text-sm text-wiki-text leading-relaxed list-disc pl-5 space-y-1 mt-2'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-wiki-text">개인정보처리방침</h1>
      <p className="text-sm text-wiki-text-muted mt-2">
        포도위키(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.
        본 방침은 포도위키 웹사이트와 포도위키 모바일 앱에 공통으로 적용됩니다.
      </p>

      <h2 className={SECTION_TITLE}>1. 모바일 앱의 개인정보 수집</h2>
      <p className={BODY}>
        포도위키 모바일 앱은 <strong>어떠한 개인정보도 수집하지 않습니다.</strong>
      </p>
      <ul className={LIST}>
        <li>회원가입·로그인 기능이 없으며, 모든 문서 열람은 익명으로 이루어집니다.</li>
        <li>광고, 분석(analytics), 추적 도구를 사용하지 않습니다.</li>
        <li>기기 식별자, 위치 정보, 연락처 등 어떤 기기 정보에도 접근하지 않습니다.</li>
      </ul>

      <h2 className={SECTION_TITLE}>2. 웹사이트 회원 정보 (문서 편집자)</h2>
      <p className={BODY}>
        문서 편집은 웹사이트에서 관리자 승인을 받은 회원만 가능합니다. 회원가입 시 아래 정보를
        수집하며, 회원 관리 및 문서 편집 이력 표시 목적으로만 사용합니다.
      </p>
      <ul className={LIST}>
        <li>수집 항목: 이메일 주소, 이름, 소속 단체</li>
        <li>보유 기간: 회원 탈퇴 또는 삭제 요청 시까지</li>
        <li>제3자 제공: 하지 않습니다.</li>
      </ul>

      <h2 className={SECTION_TITLE}>3. 개인정보 처리 위탁</h2>
      <p className={BODY}>
        서비스는 데이터 보관 및 인증 처리를 위해 Supabase Inc.의 클라우드 인프라를 이용합니다.
        위탁받은 업체는 위탁 업무 수행 목적 외로 개인정보를 처리하지 않습니다.
      </p>

      <h2 className={SECTION_TITLE}>4. 이용자의 권리</h2>
      <p className={BODY}>
        이용자는 언제든지 본인의 개인정보에 대한 열람·정정·삭제를 요청할 수 있습니다. 아래
        연락처로 문의하시면 지체 없이 처리합니다.
      </p>

      <h2 className={SECTION_TITLE}>5. 문의처</h2>
      <p className={BODY}>
        개인정보 관련 문의:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-wiki-accent hover:underline">
          {CONTACT_EMAIL}
        </a>
      </p>

      <h2 className={SECTION_TITLE}>6. 방침 변경</h2>
      <p className={BODY}>
        본 방침이 변경되는 경우 이 페이지를 통해 공지합니다.
      </p>

      <p className="text-xs text-wiki-text-muted mt-10">시행일: 2026년 7월 10일</p>
    </div>
  )
}
