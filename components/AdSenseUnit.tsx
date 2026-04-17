"use client";

import { useEffect, useRef } from "react";

type AdUnitProps = {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
};

/**
 * AdSense 광고 슬롯 — "use client" 페이지에서 사용하는 버전.
 * NEXT_PUBLIC_ADSENSE_ID 또는 slot 이 없으면 렌더링하지 않음.
 * 승인 후 .env.local에 두 값을 모두 채우면 자동 활성화.
 */
export function AdUnit({ slot, format = "auto", responsive = true, className = "" }: AdUnitProps) {
  const pushed = useRef(false);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || !slot || pushed.current) return;
    pushed.current = true;
    try {
      // adsbygoogle 스크립트는 layout.tsx의 AdSenseScript가 로드
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, [adsenseId, slot]);

  if (!adsenseId || !slot) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
