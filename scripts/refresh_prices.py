#!/usr/bin/env python3
"""
쿠팡 상품 가격 갱신 스크립트
- products 테이블에서 search_keyword 가 있는 상품을 조회
- 쿠팡 파트너스 API 재검색으로 최신 가격을 가져옴
- sale_price / original_price / discount_percent / price_updated_at 업데이트

Usage:
    python scripts/refresh_prices.py

Cron (매 6시간):
    0 */6 * * * cd /path/to/thive-lab && python scripts/refresh_prices.py >> logs/refresh_prices.log 2>&1
"""
from __future__ import annotations

import logging
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

# ── 환경변수 로드 (.env.local 우선, 없으면 scripts/.env) ──────────────────────
load_dotenv(Path(__file__).parent.parent / ".env.local")
load_dotenv(Path(__file__).parent / ".env")

from coupang_api import search_products, pick_best_product
from supabase import create_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Supabase / 쿠팡 설정 ──────────────────────────────────────────────────────
SUPABASE_URL       = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY       = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
COUPANG_ACCESS_KEY = os.environ["COUPANG_ACCESS_KEY"]
COUPANG_SECRET_KEY = os.environ["COUPANG_SECRET_KEY"]

# 쿠팡 API 호출 간격 (초) — Rate limit 회피
API_CALL_DELAY = 1.5


def fetch_products_to_refresh(supabase) -> list[dict]:
    """search_keyword 가 있는 published 상품 목록 조회"""
    resp = (
        supabase.table("products")
        .select("id, name, search_keyword, sale_price, original_price, discount_percent")
        .eq("status", "published")
        .not_.is_("search_keyword", "null")
        .execute()
    )
    return resp.data or []


def refresh_product_price(supabase, product: dict) -> bool:
    """단일 상품의 가격을 쿠팡 API로 갱신. 성공 여부 반환."""
    keyword = product["search_keyword"]
    product_id = product["id"]

    log.info("가격 조회 중: [#%d] %s (키워드: %s)", product_id, product["name"], keyword)

    results = search_products(
        keyword=keyword,
        access_key=COUPANG_ACCESS_KEY,
        secret_key=COUPANG_SECRET_KEY,
        limit=5,
    )

    if not results:
        log.warning("  결과 없음 — 건너뜀")
        return False

    best = pick_best_product(results)
    if not best:
        log.warning("  최적 상품 선정 실패 — 건너뜀")
        return False

    old_price = product.get("sale_price") or product.get("original_price") or 0
    new_price  = best.product_price

    supabase.table("products").update({
        "sale_price":       best.product_price,
        "original_price":   best.original_price,
        "discount_percent": best.discount_rate,
        "price_updated_at": "now()",
        "updated_at":       "now()",
    }).eq("id", product_id).execute()

    price_diff = new_price - old_price
    sign       = "+" if price_diff >= 0 else ""
    log.info(
        "  갱신 완료: %s원 → %s원 (%s%s원) | 할인율: %d%%",
        f"{old_price:,}", f"{new_price:,}", sign, f"{price_diff:,}", best.discount_rate,
    )
    return True


def main() -> None:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    products = fetch_products_to_refresh(supabase)
    if not products:
        log.info("갱신할 상품이 없습니다.")
        return

    log.info("총 %d개 상품 가격 갱신 시작", len(products))
    success = 0

    for i, product in enumerate(products):
        if i > 0:
            time.sleep(API_CALL_DELAY)  # Rate limit 방지

        try:
            if refresh_product_price(supabase, product):
                success += 1
        except Exception as e:
            log.error("  오류 발생 [#%d %s]: %s", product["id"], product["name"], e)

    log.info("완료: %d/%d 상품 갱신됨", success, len(products))


if __name__ == "__main__":
    main()
