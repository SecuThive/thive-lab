import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Thive Lab",
  description: "Thive Lab의 개인정보처리방침입니다. 수집하는 정보, 이용 목적, 보관 기간 등을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-amber-500"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        {/* 헤더 */}
        <header className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            법적 고지
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            개인정보처리방침
          </h1>
          <p className="text-sm text-gray-400">최종 수정일: 2026년 4월 16일</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-gray-600">

          {/* 쿠팡 파트너스 고지 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">쿠팡 파트너스 고지:</span>{" "}
              이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
              제공받을 수 있습니다. 구매자에게는 추가 비용이 발생하지 않습니다.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              1. 개인정보처리방침 개요
            </h2>
            <p>
              Thive Lab(이하 &ldquo;사이트&rdquo;)은 이용자의 개인정보를 중요하게 여기며, 「개인정보
              보호법」 및 관련 법령을 준수합니다. 본 방침은 사이트가 수집하는 개인정보의
              항목, 이용 목적, 보관 기간 및 이용자의 권리에 대해 안내합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              2. 수집하는 개인정보 항목
            </h2>
            <p>사이트는 다음과 같은 개인정보를 수집할 수 있습니다.</p>
            <p className="mt-3 mb-1 font-medium text-gray-800">자동 수집 정보</p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>IP 주소, 방문 일시, 브라우저 종류, OS 정보, 쿠키</li>
              <li>Google Analytics를 통한 방문 통계 데이터 (익명 처리됨)</li>
              <li>Google AdSense를 통한 광고 노출·클릭 관련 데이터 (DART 쿠키 포함)</li>
              <li>쿠팡 파트너스 링크 클릭 시 쿠팡 측에서 수집하는 구매 관련 데이터
                (해당 정보는 쿠팡 개인정보처리방침을 따름)</li>
            </ul>
            <p className="mt-3 mb-1 font-medium text-gray-800">문의 양식을 통해 수집하는 정보</p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>이름, 이메일 주소, 문의 유형, 문의 내용</li>
              <li>수집 목적: 문의 접수 및 답변 제공</li>
              <li>보관 기간: 문의 처리 완료 후 1년 이내 파기</li>
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              * 별도 회원가입 절차는 없습니다. 문의 양식 제출 시에만 이름·이메일이 수집됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              3. 개인정보 수집 및 이용 목적
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>사이트 방문 통계 분석 및 서비스 개선</li>
              <li>맞춤형 광고 제공 (Google AdSense)</li>
              <li>쿠팡 파트너스 수수료 정산</li>
              <li>문의 접수 및 답변 제공</li>
              <li>보안 사고 예방 및 법적 의무 이행</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              4. 개인정보 보유 및 이용 기간
            </h2>
            <p>
              수집된 개인정보는 목적 달성 후 즉시 파기합니다. 단, 관련 법령에 의거하여
              보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>접속 로그 기록: 3개월 (통신비밀보호법)</li>
              <li>소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</li>
              <li>문의 내용(이름·이메일 포함): 처리 완료 후 1년</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              5. 쿠키(Cookie) 사용
            </h2>
            <p>
              사이트는 서비스 개선 및 광고 최적화를 위해 쿠키를 사용합니다.
              쿠키는 이용자의 컴퓨터에 저장되는 소량의 텍스트 파일입니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>Google Analytics 분석 쿠키: 사이트 이용 통계 수집 (익명 처리)</li>
              <li>
                Google AdSense DART 쿠키: Google이 DoubleClick DART 쿠키를 사용하여
                이 사이트 및 인터넷상의 다른 사이트에 대한 방문을 기반으로 이용자에게
                관련 광고를 게재합니다.
              </li>
              <li>쿠팡 파트너스 추적 쿠키: 구매 연결 추적 및 수수료 정산</li>
            </ul>
            <p className="mt-2">
              브라우저 설정에서 쿠키 허용 여부를 직접 설정할 수 있습니다. 쿠키를 거부하면
              일부 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              6. 제3자 서비스 및 외부 링크
            </h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="mb-1 font-medium text-gray-800">Google Analytics</p>
                <p className="text-xs text-gray-500">
                  사이트 방문 분석을 위해 Google Analytics를 사용합니다.
                  Google의 개인정보 처리에 관해서는{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-amber-500 underline">Google 개인정보처리방침</a>을 참고하세요.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="mb-1 font-medium text-gray-800">쿠팡 파트너스</p>
                <p className="text-xs text-gray-500">
                  이 사이트에는 쿠팡 파트너스 제휴 링크가 포함되어 있습니다. 링크를
                  통해 쿠팡에서 구매 시 사이트 운영자에게 일정 수수료가 지급됩니다.
                  구매 과정에서의 개인정보 처리는{" "}
                  <a href="https://www.coupang.com/np/landing/privacy.html" target="_blank"
                    rel="noopener noreferrer sponsored" className="text-amber-500 underline">
                    쿠팡 개인정보처리방침
                  </a>을 따릅니다.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="mb-1 font-medium text-gray-800">Google AdSense</p>
                <p className="text-xs text-gray-500">
                  광고 서비스를 위해 Google AdSense를 사용합니다. Google을 포함한 제3자
                  광고 업체는 쿠키(DART 쿠키 포함)를 사용하여 이용자의 관심사 및 이전 방문
                  이력을 기반으로 맞춤형 광고를 게재합니다. 이용자는 아래 링크를 통해
                  개인화 광고 수신을 거부할 수 있습니다.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-400">
                  <li>
                    <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                      className="text-amber-500 underline">Google 광고 설정</a>
                    {" "}— Google 개인화 광고 비활성화
                  </li>
                  <li>
                    <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer"
                      className="text-amber-500 underline">NAI 광고 거부 페이지</a>
                    {" "}— 제3자 광고 네트워크 옵트아웃
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              6-1. 맞춤형 광고(관심 기반 광고) 안내
            </h2>
            <p>
              Google AdSense는 이용자의 웹 이용 패턴 및 관심사를 분석하여 관련성 높은 광고를
              제공할 수 있습니다(관심 기반 광고). 이는 이용자의 이전 사이트 방문 이력을
              기반으로 합니다.
            </p>
            <p className="mt-2">
              관심 기반 광고를 원하지 않는 경우 다음 방법으로 거부할 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                  className="text-amber-500 underline">Google 광고 설정 페이지</a>에서 개인화 광고 해제
              </li>
              <li>브라우저의 쿠키 차단 또는 광고 차단 확장 프로그램 사용</li>
              <li>
                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer"
                  className="text-amber-500 underline">DAA(Digital Advertising Alliance)</a>
                {" "}옵트아웃 도구 이용
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              * 광고 거부 설정은 해당 기기 및 브라우저에만 적용됩니다.
              쿠키를 삭제하면 설정이 초기화될 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              7. 이용자의 권리
            </h2>
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc space-y-1 pl-5 text-gray-500">
              <li>개인정보 처리 현황 조회 및 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
            </ul>
            <p className="mt-2">
              권리 행사 및 문의사항은 아래 연락처로 요청하시면 지체 없이 처리합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              8. 개인정보 보호책임자
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 space-y-1 text-gray-500">
              <p><span className="font-medium text-gray-700">운영자:</span> Thive Lab</p>
              <p>
                <span className="font-medium text-gray-700">이메일:</span>{" "}
                <a href="mailto:thive8564@gmail.com" className="text-amber-500 hover:text-amber-400">
                  thive8564@gmail.com
                </a>
              </p>
              <p className="mt-2 text-xs text-gray-400">
                개인정보 침해에 관한 신고·상담은 개인정보보호위원회(privacy.go.kr) 또는
                한국인터넷진흥원(118)에 문의하실 수 있습니다.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">
              9. 방침 변경 안내
            </h2>
            <p>
              본 개인정보처리방침은 법령·정책 변경 또는 서비스 개선에 따라 수정될 수
              있습니다. 변경 시 사이트 내 공지를 통해 안내드립니다.
            </p>
          </section>

        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
