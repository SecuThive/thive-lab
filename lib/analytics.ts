/**
 * 제휴 링크 클릭 추적 유틸리티
 * - GA4 커스텀 이벤트 전송
 * - /api/click 엔드포인트로 DB 로그 저장 (카테고리별 성과 분석용)
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackAffiliateLinkClick(params: {
  productName: string;
  productPrice?: number;
  category?: string;
  slug?: string;
  position?: string;
}) {
  // ── GA4 이벤트 ──────────────────────────────────────────────────
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "click_affiliate_link", {
      event_category: "affiliate",
      event_label: params.productName,
      product_name: params.productName,
      product_price: params.productPrice,
      content_category: params.category,
      page_slug: params.slug,
      cta_position: params.position,
    });
  }

  // ── DB 로그 저장 (fire-and-forget) ──────────────────────────────
  if (typeof window !== "undefined") {
    const logKey =
      params.slug ??
      `product-${params.productName.toLowerCase().replace(/\s+/g, "-").slice(0, 80)}`;
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: logKey,
        category: params.category ?? null,
        position: params.position ?? null,
      }),
    }).catch(() => {});
  }
}
