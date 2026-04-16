import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ── 쿠팡 파트너스 HMAC-SHA256 인증 헤더 생성 ─────────────────────────────────

function makeCoupangAuthHeader(method: string, pathWithQuery: string): string {
  const accessKey = process.env.COUPANG_ACCESS_KEY!;
  const secretKey = process.env.COUPANG_SECRET_KEY!;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dt =
    now.getUTCFullYear().toString().slice(2) +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    "T" +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds()) +
    "Z";

  // path?query → message = dt + method + path + query (? 제외)
  const [path, query = ""] = pathWithQuery.split("?");
  const message = dt + method + path + query;

  const signature = createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${dt}, signature=${signature}`;
}

// ── 쿠팡 상품 검색 ────────────────────────────────────────────────────────────

interface CoupangItem {
  productName: string;
  productPrice: number;
  originalPrice: number;
  discountRate: number;
  ratingValue: number;
  ratingCount: number;
}

async function searchCoupang(keyword: string): Promise<CoupangItem[]> {
  const BASE = "https://api-gateway.coupang.com";
  const SEARCH_PATH = "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";

  const qs = new URLSearchParams({ keyword, limit: "5", subId: "thivelab" }).toString();
  const pathWithQuery = `${SEARCH_PATH}?${qs}`;
  const url = `${BASE}${pathWithQuery}`;

  const auth = makeCoupangAuthHeader("GET", pathWithQuery);

  const res = await fetch(url, {
    headers: {
      Authorization: auth,
      "Content-Type": "application/json;charset=UTF-8",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`쿠팡 API 오류: ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  return body?.data?.productData ?? [];
}

// ── 최적 상품 선정 (Python pick_best_product 와 동일 로직) ───────────────────

function pickBest(items: CoupangItem[]): CoupangItem | null {
  if (!items.length) return null;
  const good = items.filter((p) => p.ratingValue >= 4.0 && p.ratingCount >= 500);
  if (good.length) {
    return good.sort((a, b) => b.ratingValue - a.ratingValue || b.ratingCount - a.ratingCount)[0];
  }
  const rated = items.filter((p) => p.ratingValue > 0);
  return rated.length ? rated.sort((a, b) => b.ratingValue - a.ratingValue)[0] : items[0];
}

// ── POST /api/products/refresh-prices ────────────────────────────────────────

export async function POST(req: NextRequest) {
  // REVALIDATE_SECRET 으로 인증
  const secret = req.headers.get("x-refresh-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 런타임에 클라이언트 생성 (빌드 타임 env 누락 방지)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // search_keyword 가 있는 상품 조회
  const { data: products, error: fetchErr } = await supabaseAdmin
    .from("products")
    .select("id, name, search_keyword, sale_price")
    .eq("status", "published")
    .not("search_keyword", "is", null);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const results: { id: number; name: string; status: "updated" | "skipped"; newPrice?: number }[] = [];

  for (const product of products ?? []) {
    try {
      const items = await searchCoupang(product.search_keyword);
      const best = pickBest(items);

      if (!best) {
        results.push({ id: product.id, name: product.name, status: "skipped" });
        continue;
      }

      await supabaseAdmin
        .from("products")
        .update({
          sale_price: best.productPrice,
          original_price: best.originalPrice,
          discount_percent: best.discountRate,
          price_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      results.push({ id: product.id, name: product.name, status: "updated", newPrice: best.productPrice });

      // Rate limit 방지
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`[refresh-prices] #${product.id} 오류:`, e);
      results.push({ id: product.id, name: product.name, status: "skipped" });
    }
  }

  const updated = results.filter((r) => r.status === "updated").length;
  return NextResponse.json({ ok: true, updated, total: results.length, results });
}
