import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "이용약관 | Thive Lab",
  description: "Thive Lab 이용약관입니다. 서비스 이용 조건, 면책 사항, 쿠팡 파트너스 관련 안내를 확인하세요.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* 헤더 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-500/6 via-transparent to-transparent"
      />

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        {/* 헤더 */}
        <header className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            법적 고지
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            이용약관
          </h1>
          <p className="text-sm text-zinc-500">최종 수정일: 2026년 4월 16일</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-300">

          {/* 쿠팡 파트너스 고지 */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-amber-400">쿠팡 파트너스 고지:</span>{" "}
              이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
              제공받을 수 있습니다. 구매자에게는 추가 비용이 발생하지 않습니다.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제1조 (목적)
            </h2>
            <p>
              본 약관은 Thive Lab(이하 &ldquo;사이트&rdquo;)이 제공하는 서비스를 이용함에 있어
              이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제2조 (서비스 설명)
            </h2>
            <p>
              Thive Lab은 쿠팡 파트너스 제휴 기반의 상품 추천 및 리뷰 정보를 제공하는
              정보 공유 사이트입니다. 사이트에서 제공하는 주요 서비스는 다음과 같습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>카테고리별 제품 추천 및 비교 리뷰 콘텐츠 제공</li>
              <li>쿠팡 최저가 구매 링크 안내 (파트너스 제휴 링크 포함)</li>
              <li>HOT 딜 및 에디터 픽 상품 정보 제공</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제3조 (이용 조건)
            </h2>
            <p>
              사이트에 접속하고 콘텐츠를 열람함으로써 이용자는 본 약관에 동의한 것으로
              간주합니다. 약관에 동의하지 않으시면 사이트 이용을 중단해 주시기 바랍니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제4조 (콘텐츠 및 정보 정확성)
            </h2>
            <p>
              사이트에 게재된 제품 정보, 가격, 리뷰 내용은 작성 시점을 기준으로 하며,
              실제 판매 가격 및 제품 사양은 쿠팡 등 판매 플랫폼에서 변경될 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>게시된 가격 정보는 참고용이며 실제 구매가와 다를 수 있습니다.</li>
              <li>리뷰 내용은 운영자의 개인적인 사용 경험을 바탕으로 작성됩니다.</li>
              <li>제품 구매 전 쿠팡 상품 페이지에서 최신 정보를 반드시 확인하시기 바랍니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제4조의2 (AI 생성 콘텐츠 고지)
            </h2>
            <p>
              사이트의 일부 콘텐츠(리뷰, 가이드, 상품 설명 등)는 AI(인공지능) 기술을 활용하여
              작성될 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>AI 생성 콘텐츠는 최대한 정확한 정보를 담도록 검수하지만, 일부 내용이
                부정확하거나 최신 정보를 반영하지 못할 수 있습니다.</li>
              <li>의료, 법률, 재무 등 전문 분야와 관련된 정보는 반드시 전문가의 조언을
                병행하시기 바랍니다.</li>
              <li>콘텐츠 내 오류를 발견하신 경우 운영자에게 신고해 주시면 신속히 검토 후
                수정합니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제5조 (쿠팡 파트너스 제휴 링크)
            </h2>
            <p>
              이 사이트는 쿠팡 파트너스 프로그램에 참여하고 있으며, 제휴 링크를 통한
              구매 시 운영자에게 수수료가 지급됩니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>제휴 링크 이용 시 구매자에게 추가 비용이 발생하지 않습니다.</li>
              <li>수수료는 콘텐츠의 객관성에 영향을 주지 않습니다.</li>
              <li>제휴 링크임을 명시한 경우 이를 인지하고 이용하시기 바랍니다.</li>
              <li>실제 구매, 결제, 배송, 환불은 쿠팡의 정책을 따릅니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제6조 (지식재산권)
            </h2>
            <p>
              사이트에 게재된 텍스트, 이미지, 레이아웃 등 모든 콘텐츠의 저작권은
              Thive Lab에 있습니다. 무단 복제, 배포, 전송은 금지됩니다.
            </p>
            <p className="mt-2">
              단, 출처를 명시한 인용 및 공유는 허용됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제7조 (면책 조항)
            </h2>
            <p>사이트는 다음 사항에 대해 책임을 지지 않습니다.</p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>이용자가 사이트 정보를 기반으로 한 구매 결정으로 인한 손해</li>
              <li>제3자 사이트(쿠팡 등)에서 발생한 결제·배송·환불 관련 문제</li>
              <li>서비스 이용 중 발생한 기술적 장애 또는 데이터 손실</li>
              <li>천재지변, 서버 장애 등 불가항력적 사유로 인한 서비스 중단</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제8조 (외부 링크)
            </h2>
            <p>
              사이트는 쿠팡, 네이버, 구글 등 외부 사이트로의 링크를 포함할 수 있습니다.
              외부 사이트의 내용 및 서비스에 대해 Thive Lab은 책임을 지지 않으며,
              각 사이트의 약관 및 개인정보처리방침이 적용됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제9조 (약관의 변경)
            </h2>
            <p>
              Thive Lab은 관련 법령 변경 또는 서비스 정책에 따라 본 약관을 수정할 수 있습니다.
              변경된 약관은 사이트 내 공지 후 효력이 발생하며, 변경 후 계속 이용 시
              변경 약관에 동의한 것으로 간주합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제10조 (준거법 및 관할)
            </h2>
            <p>
              본 약관은 대한민국 법률에 따라 해석 및 적용됩니다. 서비스 이용과 관련된
              분쟁은 대한민국 관할 법원을 통해 해결합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제11조의1 (금지 행위)
            </h2>
            <p>이용자는 사이트를 이용함에 있어 다음 행위를 해서는 안 됩니다.</p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>사이트 콘텐츠의 무단 스크래핑, 크롤링, 대량 복제</li>
              <li>사이트 운영을 방해하는 악성 코드 배포 또는 해킹 시도</li>
              <li>다른 이용자 또는 제3자를 사칭하거나 허위 정보를 유포하는 행위</li>
              <li>스팸 문의 발송, 광고성 메시지를 통한 서비스 남용</li>
              <li>관련 법령에 위반되는 모든 행위</li>
            </ul>
            <p className="mt-2">
              금지 행위 적발 시 사이트 이용 제한 및 관련 법적 조치가 취해질 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제11조의2 (광고 콘텐츠 고지)
            </h2>
            <p>
              사이트에는 Google AdSense를 통해 제공되는 광고가 게재될 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>광고는 Google AdSense 정책에 따라 자동으로 선정·게재되며, 운영자가
                개별 광고 내용을 선별하지 않습니다.</li>
              <li>광고 내용은 사이트의 추천 또는 보증을 의미하지 않으며, 광고주와의
                이해관계가 콘텐츠의 객관성에 영향을 주지 않습니다.</li>
              <li>광고 클릭 또는 광고 상품 구매 시 발생하는 모든 거래는 해당 광고주의
                책임이며 Thive Lab은 이에 대해 책임을 지지 않습니다.</li>
              <li>쿠팡 파트너스 제휴 링크가 포함된 콘텐츠는 별도로 그 사실을 명시합니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white border-b border-zinc-800 pb-2">
              제12조 (문의처)
            </h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 space-y-1 text-zinc-400">
              <p><span className="text-zinc-300 font-medium">운영자:</span> Thive Lab</p>
              <p>
                <span className="text-zinc-300 font-medium">이메일:</span>{" "}
                <a href="mailto:thive8564@gmail.com" className="text-amber-400 hover:text-amber-300">
                  thive8564@gmail.com
                </a>
              </p>
            </div>
          </section>

        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-amber-400"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
