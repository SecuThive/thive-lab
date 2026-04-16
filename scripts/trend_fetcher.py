#!/usr/bin/env python3
"""
ThiveLab Google Trends 수집기

Google Trends (pytrends) 기반으로 한국 실시간 급상승 키워드를 수집하고,
ThiveLab SITE_CATEGORIES 에 맞는 쇼핑 트렌드 토픽으로 변환합니다.

Usage:
    python trend_fetcher.py                # 전체 트렌드 출력
    python trend_fetcher.py --category 가전/IT
    python trend_fetcher.py --limit 5

    # blog_generator.py 에서 import
    from trend_fetcher import get_trending_topics
"""

from __future__ import annotations

import argparse
import logging
import time
import re
from typing import Optional

# ── urllib3 v2 / pytrends 4.9.x 호환성 패치 ─────────────────────────────────
# urllib3 v2 에서 method_whitelist → allowed_methods 로 변경됨.
# pytrends 4.9.x 가 아직 method_whitelist 를 사용해 TypeError 발생.
try:
    import urllib3.util.retry as _retry_mod
    _OrigRetry = _retry_mod.Retry
    class _PatchedRetry(_OrigRetry):
        def __init__(self, *args, **kwargs):
            if "method_whitelist" in kwargs and "allowed_methods" not in kwargs:
                kwargs["allowed_methods"] = kwargs.pop("method_whitelist")
            elif "method_whitelist" in kwargs:
                kwargs.pop("method_whitelist")
            super().__init__(*args, **kwargs)
    _retry_mod.Retry = _PatchedRetry
except Exception:
    pass

log = logging.getLogger(__name__)

# ── 카테고리별 매핑 키워드 ────────────────────────────────────────────────────
# 트렌드 키워드가 아래 단어를 포함하면 해당 카테고리로 분류
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "가전/IT": [
        "청소기", "로봇청소기", "무선청소기", "에어컨", "냉장고", "세탁기", "건조기",
        "TV", "모니터", "이어폰", "무선이어폰", "에어팟", "블루투스", "스피커",
        "키보드", "마우스", "노트북", "태블릿", "스마트폰", "충전기", "배터리",
        "보조배터리", "웹캠", "카메라", "프린터", "공유기", "SSD", "하드디스크",
        "전기면도기", "드론", "스마트워치", "갤럭시", "아이폰", "아이패드",
    ],
    "생활용품": [
        "청소용품", "수납", "정리함", "세제", "섬유유연제", "빨래", "침구",
        "이불", "베개", "매트리스", "가습기", "공기청정기", "제습기", "선풍기",
        "서큘레이터", "청소포", "물티슈", "욕실", "변기", "샤워기",
    ],
    "주방": [
        "밥솥", "전기밥솥", "냄비", "프라이팬", "커피머신", "커피", "믹서기",
        "에어프라이어", "인덕션", "전기레인지", "도마", "식칼", "그릇", "텀블러",
        "보온병", "전자레인지", "오븐", "토스터", "와플", "식기세척기",
    ],
    "뷰티/헬스": [
        "선크림", "마스크팩", "에센스", "세럼", "토너", "로션", "크림",
        "영양제", "비타민", "유산균", "오메가", "혈압계", "체중계", "체지방계",
        "마사지기", "드라이어", "헤어", "전동칫솔", "면도기", "제모기",
        "혈당계", "산소포화도", "밴드", "파스",
    ],
    "스포츠": [
        "운동", "헬스", "요가", "필라테스", "자전거", "덤벨", "바벨",
        "러닝화", "운동화", "등산화", "스마트밴드", "폼롤러", "스트레칭",
        "수영", "골프", "테니스", "배드민턴", "축구", "농구",
    ],
    "아이디어": [
        "정리함", "거치대", "LED", "조명", "스탠드", "스마트플러그",
        "케이블", "멀티탭", "선정리", "휴대용", "접이식", "캠핑",
        "차량용", "방향제", "가습기", "미니",
    ],
    "유아/교육": [
        "아기", "유아", "신생아", "아기띠", "유모차", "카시트", "분유",
        "기저귀", "물티슈", "장난감", "블록", "어린이", "교육", "학습",
        "문제집", "학습지", "태블릿 아이",
    ],
    "식품": [
        "단백질", "프로틴", "다이어트", "건강기능식품", "비타민 식품",
        "영양제 식품", "밀키트", "간식", "견과류", "그래놀라", "두유",
        "홍삼", "흑마늘", "콜라겐", "유산균 식품",
    ],
}

# 실시간 트렌드에서 제외할 키워드 (뉴스·연예·정치 등 쇼핑과 무관)
EXCLUDE_KEYWORDS: list[str] = [
    "사망", "사고", "사건", "범죄", "경찰", "검찰", "대통령", "국회",
    "선거", "정치", "연예", "드라마", "영화", "가수", "배우", "아이돌",
    "스포츠 경기", "야구", "축구 선수", "올림픽", "월드컵",
    "주식", "코인", "비트코인", "환율",
]


def _is_shopping_relevant(keyword: str) -> bool:
    """쇼핑과 무관한 키워드 필터링"""
    kw_lower = keyword.lower()
    return not any(exc in kw_lower for exc in EXCLUDE_KEYWORDS)


def match_category(keyword: str) -> Optional[str]:
    """키워드를 SITE_CATEGORIES 중 하나로 매핑. 매핑 실패 시 None."""
    for category, kw_list in CATEGORY_KEYWORDS.items():
        for kw in kw_list:
            if kw in keyword or keyword in kw:
                return category
    return None


def fetch_realtime_trends(limit: int = 30) -> list[str]:
    """
    Google Trends 한국 실시간 급상승 검색어 수집.

    방법 1: Google Trends RSS (geo=KR) — 가장 안정적, API 키 불필요
    방법 2: pytrends realtime_trending_searches (fallback)
    실패 시 빈 리스트 반환 (blog_generator 는 고정 TOPICS 로 fallback).
    """
    # ── 방법 1: Google Trends RSS 피드 ────────────────────────────
    keywords = _fetch_trends_rss(limit)
    if keywords:
        return keywords

    # ── 방법 2: pytrends realtime_trending_searches (fallback) ───
    keywords = _fetch_trends_pytrends(limit)
    if keywords:
        return keywords

    log.warning("[Trends] 모든 수집 방법 실패")
    return []


def _fetch_trends_rss(limit: int = 30) -> list[str]:
    """Google Trends 공식 RSS 피드에서 한국 급상승 키워드 파싱."""
    import requests
    import xml.etree.ElementTree as ET

    url = "https://trends.google.com/trending/rss?geo=KR"
    try:
        resp = requests.get(url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (compatible; ThiveLab/1.0)"
        })
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        # RSS <item><title> 파싱
        keywords = []
        for item in root.iter("item"):
            title_el = item.find("title")
            if title_el is not None and title_el.text:
                keywords.append(title_el.text.strip())
            if len(keywords) >= limit:
                break
        log.info("[Trends RSS] %d개 키워드 수집", len(keywords))
        return keywords
    except Exception as e:
        log.debug("[Trends RSS] 실패: %s", e)
        return []


def _fetch_trends_pytrends(limit: int = 30) -> list[str]:
    """pytrends realtime_trending_searches fallback."""
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl="ko-KR", tz=540, timeout=(10, 30), retries=2, backoff_factor=1.0)
        df = pytrends.realtime_trending_searches(pn="KR")
        if df is not None and not df.empty:
            col = df.columns[0]
            keywords = df[col].tolist()[:limit]
            log.info("[Trends pytrends] %d개 키워드 수집", len(keywords))
            return keywords
    except Exception as e:
        log.debug("[Trends pytrends] 실패: %s", e)
    return []


def score_keywords_by_trend(keywords: list[str], geo: str = "KR") -> dict[str, int]:
    """
    pytrends interest_over_time 으로 키워드별 최근 7일 관심도 점수 반환.
    최대 5개씩 배치 처리 (Google 제한).
    """
    try:
        from pytrends.request import TrendReq
    except ImportError:
        return {}

    scores: dict[str, int] = {}
    batch_size = 5

    try:
        pytrends = TrendReq(hl="ko-KR", tz=540, timeout=(10, 30), retries=2, backoff_factor=1.0)

        for i in range(0, len(keywords), batch_size):
            batch = keywords[i : i + batch_size]
            try:
                pytrends.build_payload(
                    batch,
                    cat=18,             # Shopping 카테고리
                    timeframe="now 7-d",
                    geo=geo,
                )
                df = pytrends.interest_over_time()
                if not df.empty:
                    for kw in batch:
                        if kw in df.columns:
                            scores[kw] = int(df[kw].mean())
                time.sleep(2.0)         # Rate limit 방지
            except Exception as e:
                log.debug("[Trends] 배치 점수 조회 실패 (%s): %s", batch, e)
                time.sleep(3.0)

    except Exception as e:
        log.warning("[Trends] 관심도 점수 조회 실패: %s", e)

    return scores


def _keyword_to_topic(kw: str, category: str, score: int = 0) -> dict:
    """트렌드 키워드 하나를 blog_generator TOPICS 형식 dict 로 변환."""
    safe_key = re.sub(r"[^a-zA-Z0-9가-힣]", "_", kw)
    return {
        "key":            f"trend_{safe_key}_{int(time.time())}",
        "title":          f"{kw} 추천 — 가성비 비교 가이드",
        "category":       category,
        "search_keyword": kw,
        "is_trend":       True,
        "trend_score":    score,
        "dynamic":        True,   # 고정 TOPICS 가 아닌 동적 생성 표시
    }


def _fetch_pytrends_shopping_keywords(
    category_filter: Optional[str] = None,
    limit: int = 30,
) -> list[tuple[str, str, int]]:
    """
    pytrends 쇼핑 카테고리(cat=18) 인기 검색어를 수집.
    반환: [(keyword, category, score), ...]
    """
    try:
        from pytrends.request import TrendReq
    except ImportError:
        return []

    results: list[tuple[str, str, int]] = []
    try:
        pytrends = TrendReq(hl="ko-KR", tz=540, timeout=(10, 30), retries=2, backoff_factor=1.0)

        # 카테고리별 대표 시드 키워드로 관련 쿼리 수집
        seed_keywords: list[str] = []
        if category_filter:
            seed_keywords = CATEGORY_KEYWORDS.get(category_filter, [])[:3]
        else:
            # 전체 카테고리에서 각 2개씩
            for kws in CATEGORY_KEYWORDS.values():
                seed_keywords.extend(kws[:2])

        seed_keywords = seed_keywords[:5]  # Google 제한
        if not seed_keywords:
            return []

        pytrends.build_payload(seed_keywords, cat=18, timeframe="now 7-d", geo="KR")
        related = pytrends.related_queries()

        for seed in seed_keywords:
            df_top = related.get(seed, {}).get("top")
            if df_top is None or df_top.empty:
                continue
            for _, row in df_top.head(5).iterrows():
                kw    = str(row.get("query", "")).strip()
                score = int(row.get("value", 0))
                if not kw or not _is_shopping_relevant(kw):
                    continue
                cat = match_category(kw)
                if not cat:
                    continue
                if category_filter and cat != category_filter:
                    continue
                results.append((kw, cat, score))

        log.info("[Trends pytrends shopping] 수집 키워드: %d개", len(results))
        time.sleep(2)
    except Exception as e:
        log.debug("[Trends pytrends shopping] 실패: %s", e)

    return results


def get_trending_topics(
    category_filter: Optional[str] = None,
    limit: int = 5,
    all_topics: Optional[list[dict]] = None,
    exclude_published: Optional[set] = None,
) -> list[dict]:
    """
    Google Trends 기반 동적 토픽 생성.

    고정 TOPICS 목록에 의존하지 않고, 실시간 트렌드 키워드 자체를 토픽으로 변환.

    전략:
    1. Google Trends RSS 급상승 → 쇼핑 키워드 필터 → 카테고리 매핑
    2. pytrends 쇼핑 카테고리(cat=18) 관련 쿼리 → 추가 키워드 수집
    3. 이미 발행된 키워드(exclude_published) 제외
    4. pytrends interest_over_time 으로 관심도 점수 계산 후 정렬
    5. 고정 TOPICS 는 보완 소스로만 활용 (all_topics 전달 시)

    Returns:
        blog_generator TOPICS 형식과 호환되는 dict 리스트.
        각 dict 에 'is_trend': True, 'trend_score': int 포함.
    """
    published = exclude_published or set()

    # ── Step 1: RSS 급상승 키워드 수집 ────────────────────────────
    raw_rss = fetch_realtime_trends(limit=50)
    rss_candidates: list[tuple[str, str]] = []  # (keyword, category)
    for kw in raw_rss:
        if not _is_shopping_relevant(kw):
            continue
        if kw in published:
            continue
        category = match_category(kw)
        if not category:
            continue
        if category_filter and category != category_filter:
            continue
        rss_candidates.append((kw, category))
        log.info("[Trends RSS] 쇼핑 키워드: %s [%s]", kw, category)

    # ── Step 2: pytrends 쇼핑 카테고리 관련 쿼리 수집 ────────────
    pt_candidates: list[tuple[str, str, int]] = []
    if len(rss_candidates) < limit:
        pt_candidates = _fetch_pytrends_shopping_keywords(category_filter, limit=30)
        pt_candidates = [(kw, cat, sc) for kw, cat, sc in pt_candidates if kw not in published]

    # ── Step 3: 고정 TOPICS 보완 소스 ────────────────────────────
    base_topics = all_topics or []
    fixed_candidates: list[tuple[str, str]] = [
        (t["search_keyword"], t.get("category", ""))
        for t in base_topics
        if t.get("search_keyword")
        and t["search_keyword"] not in published
        and (not category_filter or t.get("category") == category_filter)
    ]

    # ── Step 4: 관심도 점수 계산 ─────────────────────────────────
    all_kws: list[str] = list({
        kw for kw, _ in rss_candidates
    } | {
        kw for kw, _, _ in pt_candidates
    } | {
        kw for kw, _ in fixed_candidates
    })[:25]  # Google 제한

    scores: dict[str, int] = {}
    if all_kws:
        scores = score_keywords_by_trend(all_kws)
        if scores:
            top5 = sorted(scores.items(), key=lambda x: -x[1])[:5]
            log.info("[Trends] 관심도 Top5: %s", ", ".join(f"{k}({v})" for k, v in top5))
        else:
            log.warning("[Trends] 관심도 점수 없음 — 수집 순서 유지")

    # ── Step 5: 후보 통합 + 점수순 정렬 ──────────────────────────
    # (keyword, category, score, source_priority) — 낮을수록 우선
    merged: dict[str, tuple[str, str, int, int]] = {}

    for kw, cat in rss_candidates:
        merged[kw] = (kw, cat, scores.get(kw, 90), 1)  # RSS = 최우선

    for kw, cat, pt_score in pt_candidates:
        if kw not in merged:
            merged[kw] = (kw, cat, scores.get(kw, pt_score), 2)

    for kw, cat in fixed_candidates:
        if kw not in merged:
            merged[kw] = (kw, cat, scores.get(kw, 0), 3)

    ranked = sorted(merged.values(), key=lambda x: (x[3], -x[2]))

    # ── Step 6: 카테고리 다양성 확보 후 limit 개 선택 ─────────────
    topics: list[dict] = []
    used_categories: set[str] = set()

    for kw, cat, score, _ in ranked:
        if len(topics) >= limit:
            break
        if cat in used_categories:
            continue
        used_categories.add(cat)

        # 고정 TOPICS 에 있으면 원본 구조 활용, 없으면 동적 생성
        base = next(
            (t for t in base_topics if t.get("search_keyword") == kw),
            None,
        )
        if base:
            topics.append({**base, "is_trend": True, "trend_score": score})
        else:
            topics.append(_keyword_to_topic(kw, cat, score))

        log.info("[Trends] 토픽 확정: %s [%s] score=%d", kw, cat, score)

    # 카테고리 다양성 못 채우면 same-category 재허용
    if len(topics) < limit:
        for kw, cat, score, _ in ranked:
            if len(topics) >= limit:
                break
            if any(t["search_keyword"] == kw for t in topics):
                continue
            base = next(
                (t for t in base_topics if t.get("search_keyword") == kw),
                None,
            )
            if base:
                topics.append({**base, "is_trend": True, "trend_score": score})
            else:
                topics.append(_keyword_to_topic(kw, cat, score))

    if not topics:
        log.warning("[Trends] 트렌드 토픽 없음 — blog_generator 가 고정 TOPICS 로 fallback")

    return topics


# ── CLI 직접 실행 ─────────────────────────────────────────────────────────────

def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    parser = argparse.ArgumentParser(description="Google Trends 쇼핑 토픽 수집기")
    parser.add_argument("--category", type=str, default=None, help="특정 카테고리 필터")
    parser.add_argument("--limit",    type=int, default=5,    help="최대 토픽 수 (기본: 5)")
    parser.add_argument("--raw",      action="store_true",    help="원시 트렌드 키워드만 출력")
    args = parser.parse_args()

    if args.raw:
        print("\n[실시간 급상승 검색어 - 한국]")
        for i, kw in enumerate(fetch_realtime_trends(limit=20), 1):
            print(f"  {i:2d}. {kw}")
        return

    # blog_generator 의 TOPICS 를 import 해서 관심도 점수 비교
    try:
        from blog_generator import TOPICS as _TOPICS
    except ImportError:
        _TOPICS = []

    topics = get_trending_topics(
        category_filter=args.category,
        limit=args.limit,
        all_topics=_TOPICS,
    )

    if not topics:
        print("\n매핑된 쇼핑 트렌드가 없습니다.")
        return

    print(f"\n[트렌드 기반 생성 토픽 — {len(topics)}개]")
    print("─" * 60)
    for t in topics:
        score_str = f"  (관심도 {t['trend_score']})" if t['trend_score'] else ""
        print(f"  키워드 : {t['search_keyword']}{score_str}")
        print(f"  카테고리: {t['category']}")
        print(f"  임시제목: {t['title']}")
        print()


if __name__ == "__main__":
    main()
