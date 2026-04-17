"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { trackAffiliateLinkClick } from "@/lib/analytics";

const GUDOKPIN_URL = "https://www.gudokpin.com/subscribe?ref=구독핀oeOkh";

export function GudokpinCTA() {
  return (
    <a
      href={GUDOKPIN_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        trackAffiliateLinkClick({
          productName: "구독핀 OTT 구독 공유",
          category: "구독서비스",
          slug: "gudokpin-ott-partner",
          position: "home_partner_banner",
        })
      }
      className="group shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-400/30 transition hover:bg-violet-500 active:scale-95"
    >
      <Play className="h-3.5 w-3.5 fill-white" />
      지금 할인받고 시작하기
      <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
