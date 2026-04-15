/**
 * GA4 커스텀 이벤트 전송 유틸리티
 * 쿠팡 제휴 링크 클릭 추적용
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
}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'click_affiliate_link', {
    event_category: 'affiliate',
    event_label: params.productName,
    product_name: params.productName,
    product_price: params.productPrice,
    content_category: params.category,
    page_slug: params.slug,
  });
}
