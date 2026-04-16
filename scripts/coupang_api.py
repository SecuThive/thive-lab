#!/usr/bin/env python3
"""
쿠팡 파트너스 API 클라이언트 — HMAC-SHA256 인증 + 상품 검색

Usage:
    from coupang_api import search_products, format_products_for_prompt

Docs:
    https://developers.coupang.com/affiliate/
"""
from __future__ import annotations

import datetime
import hashlib
import hmac
import logging
import time
import urllib.parse
from dataclasses import dataclass, field

import requests

log = logging.getLogger(__name__)

COUPANG_BASE = "https://api-gateway.coupang.com"
SEARCH_PATH  = "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search"


# ── 상품 데이터 클래스 ─────────────────────────────────────────────────────────

@dataclass
class CoupangProduct:
    product_name:   str
    product_price:  int          # 판매가 (원)
    original_price: int          # 정가 (원)
    discount_rate:  int          # 할인율 (%)
    rating:         float        # 평점 (0~5)
    rating_count:   int          # 리뷰 수
    product_image:  str          # 상품 이미지 URL
    product_url:    str          # 쿠팡 파트너스 제휴 링크
    is_rocket:      bool = False # 로켓배송 여부

    @property
    def price_str(self) -> str:
        """
        LLM 프롬프트에 주입되는 가격 문자열.
        현재 판매가(할인가)를 명확히 강조하고, 정가는 참고용으로만 표기.
        """
        if self.discount_rate > 0 and self.original_price > self.product_price:
            return (
                f"현재가 {self.product_price:,}원"
                f" (정가 {self.original_price:,}원에서 {self.discount_rate}% 할인된 가격)"
            )
        return f"{self.product_price:,}원"

    @property
    def rating_str(self) -> str:
        if self.rating > 0:
            return f"★{self.rating:.1f} ({self.rating_count:,}개 리뷰)"
        return "리뷰 정보 없음"


# ── HMAC 인증 헤더 생성 ───────────────────────────────────────────────────────

def _make_auth_header(method: str, url: str,
                      access_key: str, secret_key: str) -> str:
    """
    쿠팡 파트너스 HMAC-SHA256 인증 헤더 생성.
    공식 문서: https://developers.coupang.com/hc/ko/articles/360033828593

    공식 Python 예제와 동일한 로직:
      path, *query = url.split("?")
      message = datetime + method + path + query (구분자 없이 연결, ? 제외)
    """
    path, *query_parts = url.split("?")
    dt = datetime.datetime.utcnow().strftime('%y%m%d') + 'T' + datetime.datetime.utcnow().strftime('%H%M%S') + 'Z'
    message = dt + method + path + (query_parts[0] if query_parts else "")
    signature = hmac.new(
        bytes(secret_key, "utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return (
        f"CEA algorithm=HmacSHA256, "
        f"access-key={access_key}, "
        f"signed-date={dt}, "
        f"signature={signature}"
    )


# ── 상품 검색 ─────────────────────────────────────────────────────────────────

def search_products(
    keyword: str,
    access_key: str,
    secret_key: str,
    limit: int = 5,
    sub_id: str = "thivelab",
) -> list[CoupangProduct]:
    """
    키워드로 쿠팡 상품 검색.

    Args:
        keyword:    검색 키워드 (예: "에어프라이어")
        access_key: 쿠팡 파트너스 Access Key
        secret_key: 쿠팡 파트너스 Secret Key
        limit:      최대 결과 수 (기본 5, 최대 50)
        sub_id:     파트너스 서브 ID (수익 추적용)

    Returns:
        CoupangProduct 리스트 (검색 실패 시 빈 리스트)
    """
    params = {
        "keyword": keyword,
        "limit":   str(min(limit, 50)),
        "subId":   sub_id,
    }
    qs              = urllib.parse.urlencode(params)
    path_with_query = f"{SEARCH_PATH}?{qs}"
    auth            = _make_auth_header("GET", path_with_query, access_key, secret_key)
    url             = f"{COUPANG_BASE}{path_with_query}"

    max_retries = 3
    for attempt in range(max_retries):
        try:
            # 재시도 시 인증 헤더 재생성 (타임스탬프 갱신)
            if attempt > 0:
                auth = _make_auth_header("GET", path_with_query, access_key, secret_key)

            resp = requests.get(
                url,
                headers={
                    "Authorization": auth,
                    "Content-Type":  "application/json;charset=UTF-8",
                },
                timeout=15,
            )

            if resp.status_code == 429:
                wait = 2 ** attempt  # 1s, 2s, 4s 지수 백오프
                log.warning("[쿠팡API] 429 Rate Limited ('%s') — %ds 후 재시도 (%d/%d)",
                            keyword, wait, attempt + 1, max_retries)
                time.sleep(wait)
                continue

            if resp.status_code == 400:
                log.warning("[쿠팡API] 잘못된 요청 ('%s'): %s", keyword, resp.text[:300])
                return []
            if resp.status_code == 401:
                log.error("[쿠팡API] 인증 실패 — Access/Secret Key를 확인하세요")
                return []
            resp.raise_for_status()

            body     = resp.json()
            raw_list = body.get("data", {}).get("productData", [])
            products: list[CoupangProduct] = []

            for item in raw_list:
                try:
                    sale_price = int(item.get("productPrice", 0) or 0)
                    orig_price = int(item.get("originalPrice", sale_price) or sale_price)
                    products.append(CoupangProduct(
                        product_name   = (item.get("productName") or "").strip(),
                        product_price  = sale_price,
                        original_price = orig_price,
                        discount_rate  = int(item.get("discountRate", 0) or 0),
                        rating         = float(item.get("ratingValue", 0.0) or 0.0),
                        rating_count   = int(item.get("ratingCount", 0) or 0),
                        product_image  = item.get("productImage", ""),
                        product_url    = item.get("productUrl", ""),
                        is_rocket      = bool(item.get("isRocket", False)),
                    ))
                except Exception as e:
                    log.debug("[쿠팡API] 상품 파싱 스킵: %s", e)

            log.info("[쿠팡API] '%s' → %d개 상품 수집", keyword, len(products))
            return products

        except requests.HTTPError as e:
            log.warning("[쿠팡API] HTTP %s ('%s'): %s",
                        e.response.status_code, keyword, e.response.text[:200])
            return []
        except Exception as e:
            log.warning("[쿠팡API] 검색 실패 ('%s'): %s", keyword, e)
            return []

    log.warning("[쿠팡API] 재시도 %d회 초과 ('%s') — 빈 결과 반환", max_retries, keyword)
    return []


# ── LLM 프롬프트용 상품 텍스트 포맷 ──────────────────────────────────────────

def format_products_for_prompt(products: list[CoupangProduct]) -> str:
    """실제 상품 데이터를 LLM 프롬프트에 주입할 텍스트로 변환"""
    if not products:
        return ""

    lines = [
        "╔══ 실제 쿠팡 상품 데이터 (반드시 아래 정보를 리뷰에 반영하세요) ══╗",
        "",
    ]
    for i, p in enumerate(products, 1):
        rocket = " [로켓배송]" if p.is_rocket else ""
        lines += [
            f"【상품 {i}】{p.product_name}{rocket}",
            f"  · 판매가(할인가, 본문에 표기할 가격): {p.product_price:,}원",
            f"  · 정가(참고용, 본문에 직접 쓰지 말 것): {p.original_price:,}원",
            f"  · 할인율: {p.discount_rate}%" if p.discount_rate > 0 else "  · 할인율: 없음",
            f"  · 평점: {p.rating_str}",
            f"  · 구매링크: {p.product_url}",
            "",
        ]
    lines.append("╚══ 위 상품 데이터 끝 ══╝")
    return "\n".join(lines)


def pick_best_product(products: list[CoupangProduct]) -> CoupangProduct | None:
    """
    리뷰 대표 상품 선정 기준:
    1. 리뷰 수 500개 이상 + 평점 4.0 이상 우선
    2. 없으면 평점 내림차순
    3. 없으면 첫 번째 상품
    """
    if not products:
        return None

    # 평점 4.0+ & 리뷰 500+ 필터
    good = [p for p in products if p.rating >= 4.0 and p.rating_count >= 500]
    if good:
        return sorted(good, key=lambda p: (-p.rating, -p.rating_count))[0]

    # 평점순
    rated = [p for p in products if p.rating > 0]
    if rated:
        return sorted(rated, key=lambda p: -p.rating)[0]

    return products[0]
