#!/usr/bin/env python3
"""
ThiveLab 쿠팡 파트너스 리뷰 자동 생성기 — v3.0

사이트 카테고리: 가전/IT · 생활용품 · 주방 · 뷰티/헬스 · 스포츠 · 아이디어 · 유아/교육 · 식품

Pipeline:
  Stage 1 · topic    : 리뷰 대상 상품 선정 + 타깃 독자 분석
  Stage 2 · outline  : 섹션별 리뷰 구조 설계
  Stage 3 · write    : 리뷰 본문 작성 (실사용 관점)
  Stage 4 · quality  : 품질 검토 + 스코어링 (0-100)
  Stage 5 · seo      : 제목/메타/슬러그/태그 SEO 최적화

Usage:
    python blog_generator.py              # 1개 생성
    python blog_generator.py --count 3    # 3개 생성
    python blog_generator.py --dry-run    # 저장 없이 출력만
    python blog_generator.py --pipeline-mode  # 구조화 마커 출력
    python blog_generator.py --category 가전/IT  # 특정 카테고리만
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import random
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

# ── 환경 변수 ──────────────────────────────────────────────────
load_dotenv(Path(__file__).parent.parent / ".env.local")

SUPABASE_URL        = (os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY        = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
OLLAMA_BASE_URL     = (os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
BLOG_LLM_MODEL      = os.getenv("BLOG_LLM_MODEL", "gemma4:e4b")
COUPANG_ACCESS_KEY  = os.getenv("COUPANG_ACCESS_KEY", "")
COUPANG_SECRET_KEY  = os.getenv("COUPANG_SECRET_KEY", "")

# ── 쿠팡 파트너스 API ──────────────────────────────────────────
try:
    from coupang_api import search_products, format_products_for_prompt, pick_best_product
    _COUPANG_AVAILABLE = True
except ImportError:
    _COUPANG_AVAILABLE = False

# ── Google Trends ──────────────────────────────────────────────
try:
    from trend_fetcher import get_trending_topics
    _TRENDS_AVAILABLE = True
except ImportError:
    _TRENDS_AVAILABLE = False

# ── 로깅 ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── 파이프라인 모드 플래그 ─────────────────────────────────────
_PIPELINE_MODE = False

def _emit(marker: str) -> None:
    if _PIPELINE_MODE:
        print(marker, flush=True)

# ── 모델 품질 우선순위 ─────────────────────────────────────────
MODEL_PRIORITY = [
    "llama3.3", "llama3.2", "llama3.1",
    "gemma4:e4b", "gemma4:27b", "gemma4:12b", "gemma4",
    "gemma3:27b", "gemma3:12b", "gemma3",
    "deepseek-r1",
    "qwen2.5:32b", "qwen2.5:14b", "qwen2.5:7b", "qwen2.5",
    "qwen2.5-coder:32b",
    "mistral-large", "mistral",
    "phi4", "phi3",
]

STATE_FILE   = Path(__file__).parent / ".pipeline_state.json"
HISTORY_FILE = Path(__file__).parent / ".blog_history.json"
COUPANG_API_LOG = Path(__file__).parent / ".coupang_api_log.json"
COUPANG_HOURLY_LIMIT = 10
HISTORY_KEEP = 30
MIN_QUALITY_SCORE = 65
MAX_WRITE_RETRY   = 2

# ── 사이트 카테고리 (UI와 동일하게 유지) ──────────────────────
SITE_CATEGORIES = ["가전/IT", "생활용품", "주방", "뷰티/헬스", "스포츠", "아이디어", "유아/교육", "식품"]

# ── 리뷰 토픽 목록 (카테고리별) ─────────────────────────────────
TOPICS = [
    # 가전/IT
    {"key": "airfryer_review",          "title": "에어프라이어 추천 베스트 — 쿠팡 평점순 비교 가이드",        "category": "가전/IT",   "search_keyword": "에어프라이어"},
    {"key": "robot_vacuum_compare",     "title": "로봇청소기 비교 2026 — 샤오미 vs 삼성 vs 에코백스",   "category": "가전/IT",   "search_keyword": "로봇청소기"},
    {"key": "wireless_earbuds",         "title": "무선 이어폰 가성비 추천 — 2만원대부터 10만원대까지",   "category": "가전/IT",   "search_keyword": "무선이어폰"},
    {"key": "portable_charger",         "title": "보조배터리 추천 — 용량별 최고 가성비 정리",            "category": "가전/IT",   "search_keyword": "보조배터리"},
    {"key": "smart_tv_review",          "title": "저렴한 스마트 TV 추천 — 40인치대 가성비 비교 가이드",           "category": "가전/IT",   "search_keyword": "스마트TV"},
    {"key": "air_purifier",             "title": "공기청정기 추천 — 평수별 최적 모델 가이드",             "category": "가전/IT",   "search_keyword": "공기청정기"},
    {"key": "mechanical_keyboard",      "title": "기계식 키보드 추천 — 입문자부터 고수까지",              "category": "가전/IT",   "search_keyword": "기계식키보드"},
    {"key": "webcam_review",            "title": "웹캠 추천 — 재택근무·스트리밍 용도별 비교",             "category": "가전/IT",   "search_keyword": "웹캠"},

    # 생활용품
    {"key": "vacuum_cleaner",           "title": "청소기 추천 — 무선 vs 유선, 상황별 최적 선택",         "category": "생활용품",  "search_keyword": "무선청소기"},
    {"key": "humidifier_review",        "title": "가습기 추천 2026 — 초음파 vs 가열식 완전 비교",        "category": "생활용품",  "search_keyword": "가습기"},
    {"key": "laundry_detergent",        "title": "세탁 세제 추천 — 피부 자극 없는 인기 제품 모음",        "category": "생활용품",  "search_keyword": "세탁세제"},
    {"key": "mattress_topper",          "title": "매트리스 토퍼 추천 — 수면 질 개선 실제 효과는?",       "category": "생활용품",  "search_keyword": "매트리스토퍼"},
    {"key": "storage_rack",             "title": "수납 선반 추천 — 좁은 집 공간 활용 아이디어",           "category": "생활용품",  "search_keyword": "수납선반"},
    {"key": "bathroom_accessories",     "title": "욕실 수납 추천 — 칫솔걸이부터 수납함까지 정리",        "category": "생활용품",  "search_keyword": "욕실수납"},

    # 주방
    {"key": "rice_cooker_review",       "title": "전기밥솥 추천 — 1인부터 4인 가족까지 용량별 정리",     "category": "주방",      "search_keyword": "전기밥솥"},
    {"key": "blender_review",           "title": "믹서기 추천 — 스무디·이유식·주스 용도별 비교",          "category": "주방",      "search_keyword": "믹서기"},
    {"key": "coffee_maker",             "title": "가정용 커피머신 추천 — 10만원대 가성비 베스트",         "category": "주방",      "search_keyword": "커피머신"},
    {"key": "induction_cooktop",        "title": "인덕션 추천 — 1구부터 2구까지 가정용 비교 가이드",        "category": "주방",      "search_keyword": "인덕션"},
    {"key": "food_container",           "title": "밀폐 용기 추천 — 냉장·냉동 보관 최강 제품들",           "category": "주방",      "search_keyword": "밀폐용기"},
    {"key": "cutting_board",            "title": "도마 추천 — 항균·위생 강한 인기 제품 정리",             "category": "주방",      "search_keyword": "도마"},

    # 뷰티/헬스
    {"key": "sunscreen_review",         "title": "선크림 추천 — SPF 높고 백탁 없는 제품 베스트",         "category": "뷰티/헬스", "search_keyword": "선크림"},
    {"key": "facial_massager",          "title": "얼굴 마사지기 추천 — 쿠팡 인기 제품 비교 가이드",         "category": "뷰티/헬스", "search_keyword": "얼굴마사지기"},
    {"key": "electric_toothbrush",      "title": "전동칫솔 추천 — 구강 관리 효과 높은 모델 비교",         "category": "뷰티/헬스", "search_keyword": "전동칫솔"},
    {"key": "hair_dryer",               "title": "헤어드라이어 추천 — 데이슨 대신 가성비 대안은?",        "category": "뷰티/헬스", "search_keyword": "헤어드라이어"},
    {"key": "blood_pressure_monitor",   "title": "혈압계 추천 — 가정용 정확도 높은 제품 비교",            "category": "뷰티/헬스", "search_keyword": "혈압계"},
    {"key": "massage_gun",              "title": "마사지건 추천 — 근막 이완 효과 실제 테스트 결과",        "category": "뷰티/헬스", "search_keyword": "마사지건"},

    # 스포츠
    {"key": "yoga_mat_review",          "title": "요가 매트 추천 — 두께·소재·미끄럼 방지 완전 비교",      "category": "스포츠",    "search_keyword": "요가매트"},
    {"key": "running_shoes",            "title": "러닝화 추천 — 발볼 넓은 분을 위한 가성비 모델",         "category": "스포츠",    "search_keyword": "러닝화"},
    {"key": "dumbbell_set",             "title": "덤벨 세트 추천 — 홈 트레이닝 입문자 가이드",            "category": "스포츠",    "search_keyword": "덤벨세트"},
    {"key": "fitness_band",             "title": "스마트밴드 추천 — 건강 관리 기능 비교 2026",           "category": "스포츠",    "search_keyword": "스마트밴드"},
    {"key": "foam_roller",              "title": "폼롤러 추천 — 운동 후 피로 회복 효과 비교",             "category": "스포츠",    "search_keyword": "폼롤러"},

    # 아이디어
    {"key": "desk_organizer",           "title": "책상 정리함 추천 — 집중력 올려주는 데스크셋업",          "category": "아이디어",  "search_keyword": "책상정리함"},
    {"key": "portable_fan",             "title": "휴대용 선풍기 추천 — 여름 필수템 가성비 베스트",        "category": "아이디어",  "search_keyword": "휴대용선풍기"},
    {"key": "led_lamp",                 "title": "LED 스탠드 추천 — 눈 피로 줄이는 조명 비교",           "category": "아이디어",  "search_keyword": "LED스탠드"},
    {"key": "cable_organizer",          "title": "케이블 정리 추천 — 선 정리 한 번에 해결하는 제품들",    "category": "아이디어",  "search_keyword": "케이블정리"},
    {"key": "smart_plug",               "title": "스마트 플러그 추천 — 전기 절약하고 편리하게",           "category": "아이디어",  "search_keyword": "스마트플러그"},

    # 유아/교육
    {"key": "baby_carrier",             "title": "아기 띠 추천 — 신생아부터 36개월 사용 가능한 모델",     "category": "유아/교육", "search_keyword": "아기띠"},
    {"key": "kids_tablet",              "title": "어린이 태블릿 추천 — 교육용 콘텐츠 강한 제품 비교",     "category": "유아/교육", "search_keyword": "어린이태블릿"},
    {"key": "baby_monitor",             "title": "베이비 모니터 추천 — 야간 촬영·울음 감지 기능 비교",    "category": "유아/교육", "search_keyword": "베이비모니터"},
    {"key": "kids_bike",                "title": "어린이 자전거 추천 — 연령별 사이즈 선택 완전 가이드",    "category": "유아/교육", "search_keyword": "어린이자전거"},
    {"key": "educational_toys",         "title": "유아 교육 장난감 추천 — 두뇌 발달에 좋은 제품 모음",    "category": "유아/교육", "search_keyword": "유아장난감"},

    # 식품
    {"key": "protein_powder",           "title": "단백질 보충제 추천 — 맛·성분 모두 잡은 가성비 베스트", "category": "식품",      "search_keyword": "단백질보충제"},
    {"key": "healthy_snacks",           "title": "건강 간식 추천 — 다이어트 중에도 먹을 수 있는 것들",   "category": "식품",      "search_keyword": "건강간식"},
    {"key": "korean_tea",               "title": "건강 차 추천 — 피로 회복과 면역력에 좋은 제품들",      "category": "식품",      "search_keyword": "건강차"},
    {"key": "cooking_oil",              "title": "식용유 추천 — 올리브유·코코넛오일·아보카도유 비교",     "category": "식품",      "search_keyword": "올리브유"},
    {"key": "meal_kit",                 "title": "밀키트 추천 — 맛있고 간편한 제품 순위 2026",          "category": "식품",      "search_keyword": "밀키트"},
]


# ══════════════════════════════════════════════════════════════
# 유틸리티
# ══════════════════════════════════════════════════════════════

def _load_history() -> list[str]:
    try:
        return json.loads(HISTORY_FILE.read_text("utf-8"))
    except Exception:
        return []

def _save_history(key: str) -> None:
    history = _load_history()
    if key not in history:
        history.insert(0, key)
    try:
        HISTORY_FILE.write_text(json.dumps(history[:HISTORY_KEEP], ensure_ascii=False), "utf-8")
    except Exception:
        pass

def pick_topic(category_filter: Optional[str] = None) -> dict:
    recent = set(_load_history())
    pool = TOPICS
    if category_filter and category_filter in SITE_CATEGORIES:
        pool = [t for t in TOPICS if t["category"] == category_filter]
    pool = [t for t in pool if t["key"] not in recent] or (pool or TOPICS)
    return random.choice(pool)

def slugify(text: str) -> str:
    """영문/숫자/하이픈만 남기는 URL-safe slug 생성 (한글 제거)"""
    text = re.sub(r"[^a-zA-Z0-9\s-]", "", text.lower())
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")[:80] or "post"

def unique_slug(base_slug: str) -> str:
    slug = slugify(base_slug)
    suffix = 2
    while True:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/blog_posts",
            params={"slug": f"eq.{slug}", "select": "id", "limit": 1},
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=10,
        )
        if resp.ok and not resp.json():
            return slug
        slug = f"{slugify(base_slug)}-{suffix}"
        suffix += 1

def _md_table_to_html(block: str) -> str:
    """마크다운 테이블 블록 → HTML <table> 변환"""
    lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
    if len(lines) < 2:
        return block

    def parse_row(line: str) -> list[str]:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        return cells

    header_cells = parse_row(lines[0])
    # 두 번째 줄이 구분선(---|---)인지 확인
    if not re.match(r"^[\s|:-]+$", lines[1]):
        return block

    rows = [parse_row(l) for l in lines[2:] if not re.match(r"^[\s|:-]+$", l)]

    html = '<div class="overflow-x-auto mb-6"><table class="w-full text-sm border-collapse">\n<thead><tr>'
    for cell in header_cells:
        html += f'<th class="border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-left text-xs font-semibold text-zinc-200">{cell}</th>'
    html += '</tr></thead>\n<tbody>'
    for row in rows:
        html += '<tr>'
        for cell in row:
            html += f'<td class="border border-zinc-800 px-3 py-2 text-zinc-300">{cell}</td>'
        html += '</tr>\n'
    html += '</tbody></table></div>'
    return html


def md_to_html(md: str) -> str:
    """마크다운 → prose-blog 클래스 호환 HTML 변환"""
    html = md

    # 1. 코드 블록 (먼저 처리 — 내부 | 등이 테이블로 오인되지 않도록)
    html = re.sub(
        r"```(\w*)\n([\s\S]*?)```",
        lambda m: f'<pre><code class="language-{m.group(1)}">{m.group(2).rstrip()}</code></pre>',
        html,
    )
    html = re.sub(r"`([^`]+)`", r"<code>\1</code>", html)

    # 2. 마크다운 테이블 → HTML <table>
    # 테이블 블록: | 로 시작하는 연속 줄 (최소 3줄: 헤더 + 구분선 + 데이터)
    def replace_table(m: re.Match) -> str:
        return _md_table_to_html(m.group(0))
    html = re.sub(
        r"(?:^[ \t]*\|.+\|[ \t]*\n){3,}",
        replace_table,
        html,
        flags=re.MULTILINE,
    )

    # 3. 헤딩
    for n in range(4, 0, -1):
        html = re.sub(r"^" + "#" * n + r" (.+)$", rf"<h{n}>\1</h{n}>", html, flags=re.MULTILINE)

    # 4. 강조
    html = re.sub(r"\*\*\*(.+?)\*\*\*", r"<strong><em>\1</em></strong>", html)
    html = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html)
    html = re.sub(r"\*(.+?)\*",     r"<em>\1</em>",         html)

    # 5. 수평선 (테이블 구분선과 혼동 방지 — 테이블은 이미 처리됨)
    html = re.sub(r"^---+$", "<hr>", html, flags=re.MULTILINE)
    html = re.sub(r"^\*\*\*+$", "<hr>", html, flags=re.MULTILINE)

    # 6. 리스트
    html = re.sub(r"^[-*] (.+)$", r"<li>\1</li>", html, flags=re.MULTILINE)
    html = re.sub(r"(<li>.*</li>)", r"<ul>\1</ul>", html, flags=re.DOTALL)

    # 7. 단락
    paragraphs = re.split(r"\n{2,}", html.strip())
    parts = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if p.startswith(("<h", "<ul", "<pre", "<hr", "<div", "<table")):
            parts.append(p)
        else:
            parts.append(f"<p>{p.replace(chr(10), '<br>')}</p>")
    return "\n".join(parts)


# ══════════════════════════════════════════════════════════════
# 모델 선택
# ══════════════════════════════════════════════════════════════

def get_available_models() -> list[str]:
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        resp.raise_for_status()
        embed_keywords = ("embed", "nomic", "bge", "e5-")
        return [
            m["name"] for m in resp.json().get("models", [])
            if not any(kw in m["name"].lower() for kw in embed_keywords)
        ]
    except Exception as e:
        log.error("[Ollama] 모델 목록 조회 실패: %s", e)
        sys.exit(1)

def select_best_model(available: list[str]) -> str:
    available_lower = {m.lower(): m for m in available}
    for preferred in MODEL_PRIORITY:
        for avail_key, avail_name in available_lower.items():
            if avail_key == preferred.lower() or avail_key.startswith(preferred.lower() + ":"):
                return avail_name
    if BLOG_LLM_MODEL in available:
        return BLOG_LLM_MODEL
    return available[0] if available else BLOG_LLM_MODEL


# ══════════════════════════════════════════════════════════════
# Ollama 호출
# ══════════════════════════════════════════════════════════════

def _chat(model: str, system: str, user: str, temperature: float = 0.7, timeout: int = 300) -> str:
    resp = requests.post(
        f"{OLLAMA_BASE_URL}/api/chat",
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "stream": False,
            "options": {"temperature": temperature},
        },
        timeout=timeout,
    )
    resp.raise_for_status()
    raw = resp.json()["message"]["content"].strip()
    # deepseek-r1 등 추론 모델의 <think> 블록 제거
    return re.sub(r"<think>[\s\S]*?</think>", "", raw, flags=re.IGNORECASE).strip()


# ══════════════════════════════════════════════════════════════
# Pipeline 상태 저장/불러오기
# ══════════════════════════════════════════════════════════════

def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), "utf-8")

def load_state() -> dict:
    try:
        return json.loads(STATE_FILE.read_text("utf-8"))
    except Exception:
        return {}


# ══════════════════════════════════════════════════════════════
# Stage 헬퍼
# ══════════════════════════════════════════════════════════════

def _stage_start(name: str) -> float:
    log.info("━━ Stage: %s ━━", name.upper())
    _emit(f"[PIPELINE:stage={name}:status=running]")
    return time.time()

def _stage_done(name: str, t0: float, extra: str = "") -> float:
    elapsed = round(time.time() - t0, 1)
    suffix = f":extra={extra}" if extra else ""
    _emit(f"[PIPELINE:stage={name}:status=done:elapsed={elapsed}{suffix}]")
    log.info("  완료 (%.1fs)", elapsed)
    return elapsed

def _stage_fail(name: str, reason: str) -> None:
    _emit(f"[PIPELINE:stage={name}:status=failed:reason={reason}]")


# ══════════════════════════════════════════════════════════════
# Stage 0 · 쿠팡 파트너스 상품 수집
# ══════════════════════════════════════════════════════════════

def _load_coupang_api_log() -> list[float]:
    """쿠팡 API 호출 타임스탬프 로그 로드."""
    try:
        data = json.loads(COUPANG_API_LOG.read_text("utf-8"))
        return data.get("timestamps", [])
    except Exception:
        return []

def _save_coupang_api_log(timestamps: list[float]) -> None:
    """쿠팡 API 호출 타임스탬프 로그 저장 (최근 1시간 내 기록만 유지)."""
    cutoff = time.time() - 3600
    recent = [ts for ts in timestamps if ts > cutoff]
    COUPANG_API_LOG.write_text(
        json.dumps({"timestamps": recent}, ensure_ascii=False, indent=2), "utf-8"
    )

def _check_coupang_rate_limit() -> bool:
    """시간당 호출 횟수가 제한 이내인지 확인. True면 호출 가능."""
    timestamps = _load_coupang_api_log()
    cutoff = time.time() - 3600
    recent = [ts for ts in timestamps if ts > cutoff]
    return len(recent) < COUPANG_HOURLY_LIMIT

def _record_coupang_api_call() -> None:
    """성공한 API 호출 타임스탬프 기록."""
    timestamps = _load_coupang_api_log()
    timestamps.append(time.time())
    _save_coupang_api_log(timestamps)


def stage_products(topic: dict) -> list:
    """쿠팡 API로 실제 상품 데이터 수집. API 미설정 또는 실패 시 빈 리스트 반환."""
    if not _COUPANG_AVAILABLE:
        log.warning("[쿠팡] coupang_api 모듈 없음 — 상품 데이터 없이 진행")
        return []
    if not COUPANG_ACCESS_KEY or not COUPANG_SECRET_KEY:
        log.warning("[쿠팡] ACCESS_KEY/SECRET_KEY 미설정 — 상품 데이터 없이 진행")
        return []

    keyword = topic.get("search_keyword") or topic["title"].split(" ")[0]
    t0 = _stage_start("products")
    log.info("  쿠팡 검색 키워드: %s", keyword)

    # ── Rate Limit 체크 ──
    if not _check_coupang_rate_limit():
        log.warning("쿠팡 API 시간당 10회 제한 초과 — 캐시 사용")
        _stage_done("products", t0, extra="rate_limited")
        return []

    products = search_products(
        keyword=keyword,
        access_key=COUPANG_ACCESS_KEY,
        secret_key=COUPANG_SECRET_KEY,
        limit=5,
        sub_id="thivelab",
    )

    if products:
        _record_coupang_api_call()

    log.info("  수집된 상품 수: %d", len(products))
    _stage_done("products", t0, extra=f"count={len(products)}")
    return products


# ══════════════════════════════════════════════════════════════
# Stage 1 · 토픽 분석
# ══════════════════════════════════════════════════════════════

def stage_topic(topic: dict, model: str) -> dict:
    t0 = _stage_start("topic")
    log.info("  토픽: %s [%s]", topic["title"], topic["category"])
    system = (
        "당신은 심리학 기반 카피라이팅 전문가이자, 2026년 구글 SEO 및 GEO(생성형 엔진 최적화)에 정통한 시니어 콘텐츠 에디터입니다. "
        "독자의 고민을 해결하는 과정에서 상품을 자연스러운 '하나의 선택지'로 제안하여 클릭률과 전환율을 높이는 콘텐츠 전략을 설계합니다."
    )
    user = f"""콘텐츠 주제: {topic['title']}
카테고리: {topic['category']}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{{
  "angle": "이 글의 핵심 차별화 포인트 (독자의 고민 → 해결책 → 상품 제안 흐름)",
  "target_buyer": "주요 구매 타깃의 구체적 페르소나 (예: 아이 2명을 둔 30대 맞벌이 부부)",
  "purchase_pain": "이 타깃이 검색창에 치는 구체적인 고민 1문장 (예: '아이 옷에 안전한 세제가 뭔지 모르겠다')",
  "longtail_keyword": "타깃이 실제 검색할 롱테일 키워드 (예: '아기 세탁세제 무향 추천')",
  "review_focus": "이 글에서 객관적으로 비교할 기준 3가지 (쉼표 구분)",
  "emotional_hook": "제목에 넣을 감정 유발 표현 (예: '실패 없는', '몰랐다면 손해', '후회 전에')",
  "tone": "글의 톤 (예: 옆집 언니 같은 친근함, 데이터 분석가의 객관성)"
}}"""
    raw = _chat(model, system, user, temperature=0.5)
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        analysis = json.loads(m.group()) if m else {}
    except Exception:
        analysis = {
            "angle": "독자 고민 해결형 정보 가이드",
            "target_buyer": "제품 선택이 막막한 일반 소비자",
            "purchase_pain": "어떤 제품을 골라야 할지 기준을 모르겠다",
            "longtail_keyword": topic.get("search_keyword", "") + " 추천",
            "review_focus": "가격, 핵심 스펙, 실구매자 만족도",
            "emotional_hook": "실패 없는",
            "tone": "친절하지만 객관적인 큐레이터",
        }
    log.info("  각도: %s | 타깃: %s", analysis.get("angle", "-"), analysis.get("target_buyer", "-"))
    _stage_done("topic", t0)
    return analysis


# ══════════════════════════════════════════════════════════════
# Stage 2 · 리뷰 구조 아웃라인
# ══════════════════════════════════════════════════════════════

def stage_outline(topic: dict, analysis: dict, model: str) -> str:
    t0 = _stage_start("outline")
    system = (
        "당신은 심리학 기반 카피라이팅 전문가이자 시니어 콘텐츠 에디터입니다. "
        "독자의 고민을 해결하는 과정에서 상품을 자연스러운 '하나의 선택지'로 제안하는 "
        "정보성 블로그 아웃라인을 설계합니다."
    )
    longtail = analysis.get('longtail_keyword', topic.get('search_keyword', ''))
    user = f"""콘텐츠 주제: {topic['title']}
카테고리: {topic['category']}
타깃 페르소나: {analysis.get('target_buyer', '')}
타깃의 핵심 고민: {analysis.get('purchase_pain', '')}
롱테일 키워드: {longtail}
비교 기준: {analysis.get('review_focus', '')}

━━ 5단계 심리 동선 기반 아웃라인 ━━
다음 구조를 반드시 지켜 H2 소제목과 각 섹션의 핵심 포인트를 설계하세요.

1️⃣ [공감 — 도입부] (H2: 질문형 소제목)
   - 검색자의 문제 상황이나 구매 동기를 먼저 공감하며 언급
   - 서론 첫 2~3문단(40~60단어)에 즉답(Direct Answer)을 역피라미드로 배치
   - 이 단계에서는 아직 특정 상품명을 언급하지 않음
   - 힌트 불릿 3개

2️⃣ [정보 및 기준 제시] (H2: 선택 기준/체크리스트)
   - 문제를 해결하기 위한 객관적인 기준이나 유용한 정보 제공
   - 이 단계까지 특정 상품명을 직접 언급하지 않음
   - 글머리 기호(리스트)나 비교 표(Table) 1개 이상 포함
   - 힌트 불릿 3개

3️⃣ [대안으로서의 상품 등장] (H2: 실제 추천 상품 비교)
   - 글의 중후반부에서 앞서 말한 기준에 부합하는 예시로 상품을 자연스럽게 등장
   - 전체 상품 요약 비교표(Table): 제품명 | 가격 | 핵심 스펙 | 평점 | 구매링크 열 포함
   - 각 상품 개별 섹션(H3): 실제 제품명·가격·스펙·장단점·적합한 사용자 + 개별 쿠팡 구매링크
   - 힌트 불릿 3개

4️⃣ [진솔한 평가] (H2: 가격대별 정리 또는 장단점 비교)
   - '최고', '최저가', '강력 추천' 등 과장 광고 단어 절대 금지
   - 장점뿐 아니라 단점·아쉬운 점도 명확히 짚어 신뢰도 확보
   - 각 상품 섹션 끝에 해당 상품의 실제 쿠팡 구매링크 배치
   - 힌트 불릿 3개

5️⃣ [행동 유도 — 결론] (H2: 최종 가이드)
   - 추천 대상 / 패스 대상 정리
   - 결론부에 두 번째 CTA(구매 링크) 배치
   - 힌트 불릿 3개"""
    outline = _chat(model, system, user, temperature=0.6)
    sections = outline.count("## ")
    log.info("  섹션 수: %d", sections)
    _stage_done("outline", t0)
    return outline


# ══════════════════════════════════════════════════════════════
# Stage 3 · 리뷰 본문 작성
# ══════════════════════════════════════════════════════════════

def stage_write(topic: dict, analysis: dict, outline: str, model: str,
                products: list | None = None, attempt: int = 1) -> str:
    t0 = _stage_start("write")
    if attempt > 1:
        log.info("  재시도 %d/%d", attempt, MAX_WRITE_RETRY + 1)

    # 실제 상품 데이터 주입
    product_context = ""
    if products and _COUPANG_AVAILABLE:
        product_context = "\n" + format_products_for_prompt(products) + "\n"
        log.info("  실제 상품 %d개 데이터 주입", len(products))

    longtail = analysis.get('longtail_keyword', topic.get('search_keyword', ''))
    emotional = analysis.get('emotional_hook', '실패 없는')

    system = f"""\
당신은 심리학 기반의 카피라이팅 전문가이자, 2026년 구글 SEO 및 GEO(생성형 엔진 최적화)에 정통한 시니어 콘텐츠 에디터입니다.
글의 톤: {analysis.get('tone', '친절하지만 객관적인 큐레이터')}

[작성 목적]
상품을 무조건적으로 홍보하는 것이 아닙니다. 독자의 고민을 해결하는 과정에서 상품을 자연스러운 '하나의 선택지'로 제안하여 클릭률과 전환율을 높이는 것입니다.

[5단계 심리 동선 — 반드시 이 순서를 지킬 것]
1. 공감(도입부): 검색자의 문제 상황이나 구매 동기를 먼저 공감하며 언급
2. 정보 및 기준 제시: 문제를 해결하기 위한 객관적인 기준이나 유용한 정보 제공 (이 단계까지 특정 상품명 언급 금지)
3. 대안으로서의 상품 등장: 글의 중후반부에서 앞서 말한 기준에 부합하는 예시로 상품을 자연스럽게 등장
4. 진솔한 평가: '최고', '최저가', '강력 추천' 등 추상적이고 과장된 광고성 단어는 절대 사용 금지. 장점뿐 아니라 단점이나 아쉬운 점도 명확히 짚어 신뢰도 확보
5. 행동 유도(CTA): 상품의 단점이나 비교 우위를 설명한 직후, 가장 적절한 타이밍에 구매 링크를 유도

[GEO/SEO 최적화 규칙]
- 직접 답변(Direct Answer): 서론의 첫 2~3문단(40~60단어) 안에 검색 의도에 대한 명확한 즉답을 역피라미드 구조로 배치
- 질문 기반 구조: H2, H3 소제목을 사용자가 실제 검색할 법한 질문 형태로 작성
- 구조화된 데이터: 1개 이상의 리스트 + 1개 이상의 비교 표(Table) 반드시 포함
- 정보 청킹: 모바일 가독성을 위해 한 문단 150~300단어 이내
- 롱테일 키워드 '{longtail}'을 제목, 첫 문단, 소제목에 자연스럽게 배치
- 제목에 감정 유발 단어 포함 (예: '{emotional}')

[절대 금지]
- '직접 써봤다', '사용해보니', '구매해서 써봤습니다' 등 1인칭 체험 표현
- '최고', '최저가', '강력 추천', '무조건', '반드시' 등 과장 광고 표현
- 수집된 상품 수보다 많은 TOP N 표기
- /blog/, /review/ 등 내부 사이트 링크 생성 금지 (존재하지 않는 URL 절대 삽입 금지)
- 쿠팡 상품 데이터에 없는 가상의 제품명·가격·스펙 작성 금지

[가격 표기 규칙 — 반드시 준수]
- 본문에 표기하는 가격은 반드시 '판매가(할인가)' 사용 (위 데이터의 '판매가(할인가, 본문에 표기할 가격)' 항목)
- 정가(원래 가격)는 직접 가격으로 언급하지 말 것 — 할인율 설명 시에만 "(정가 XX,000원에서 N% 할인)" 형태로 보조 표기
- 예시 ✓ 올바른 표기: "현재 29,900원 (정가 49,900원에서 40% 할인)"
- 예시 ✗ 잘못된 표기: "49,900원짜리 제품"(정가를 판매가인 것처럼 표기)"""

    user = f"""주제: {topic['title']}
카테고리: {topic['category']}
타깃 페르소나: {analysis.get('target_buyer', '')}
핵심 고민: {analysis.get('purchase_pain', '')}
롱테일 키워드: {longtail}
비교 기준: {analysis.get('review_focus', '')}
{product_context}
아웃라인:
{outline}

━━ 작성 규칙 ━━
- 분량: 최소 1500자 이상 (한글 기준)
- 포맷: 완벽한 마크다운 형식 (##, ###, -, |, **) — HTML 금지
- 도입부 첫 2~3문단에 즉답 배치 (역피라미드: 결론 먼저 → 상세)
- 글의 전반부(1~2단계)에서는 특정 상품명 언급하지 않고 기준만 제시
- 글의 중후반부(3단계)에서 수집된 상품 {len(products) if products else 0}개를 비교표로 자연스럽게 등장
- 각 상품 개별 섹션(### 제품명): 실제 제품명, 실제 가격, 핵심 스펙, 장단점, 적합한 사용자 기재
- 각 상품 섹션 끝에 반드시 아래 형식으로 구매 버튼 삽입 (절대 raw URL만 쓰지 말 것):
  [🛒 쿠팡에서 구매하기](실제 product_url)
- 비교표(Table) "구매링크" 열에도 반드시 마크다운 링크 형식 사용:
  [구매하러가기](실제 product_url)  ← 괄호 안에 실제 URL 필수
- "구매링크: https://..." 형식(콜론+raw URL) 절대 금지 — 항상 [텍스트](URL) 형식만 사용
- CTA는 각 상품 섹션 끝마다 개별 링크 삽입 + 결론부에 대표 상품 1회 추가
- 존재하지 않는 내부 링크(/blog/...) 절대 생성 금지 — 쿠팡 URL만 사용
- 결론: "이런 분에게 적합 / 이런 분은 다른 선택지가 나을 수 있음" 형태
- 마지막 줄: tags: 태그1, 태그2, 태그3, 태그4, 태그5"""
    draft = _chat(model, system, user, temperature=0.75 + (attempt - 1) * 0.05, timeout=400)
    word_count = len(draft.split())
    log.info("  단어 수: ~%d", word_count)
    _stage_done("write", t0)
    return draft


# ══════════════════════════════════════════════════════════════
# Stage 4 · 품질 검토 및 스코어링
# ══════════════════════════════════════════════════════════════

def stage_quality(draft: str, analysis: dict, model: str) -> tuple[str, int]:
    t0 = _stage_start("quality")
    system = (
        "당신은 심리학 기반 카피라이팅과 GEO/SEO에 정통한 시니어 에디터입니다. "
        "초고를 검토하고 '5단계 심리 동선'과 'GEO 최적화 규칙'에 부합하도록 개선합니다. "
        "과장 광고 표현, 1인칭 체험 표현이 있으면 반드시 제거합니다."
    )
    longtail = analysis.get('longtail_keyword', '')
    user = f"""타깃 페르소나: {analysis.get('target_buyer', '일반 소비자')}
롱테일 키워드: {longtail}

아래 10개 기준(각 10점, 총 100점)으로 초고를 검토하고 개선된 최종본을 JSON으로 반환하세요.

━━ 심리 동선 체크 (5항목) ━━
1. [공감] 도입부가 독자의 고민을 공감하며 시작하는가? (10점)
2. [정보] 전반부에서 상품명 없이 객관적 기준만 제시하는가? (10점)
3. [등장] 중후반부에서 상품이 기준에 부합하는 예시로 자연스럽게 등장하는가? (10점)
4. [진솔] '최고/최저가/강력 추천' 없이 장단점이 균형 있게 서술되는가? (10점)
5. [CTA] 단점 설명 직후 + 결론부에 적절히 CTA가 배치되었는가? (10점)

━━ GEO/SEO 체크 (5항목) ━━
6. [즉답] 첫 2~3문단에 검색 의도에 대한 명확한 즉답이 있는가? (10점)
7. [Q&A] H2/H3 소제목이 질문 형태로 작성되었는가? (10점)
8. [구조화] 리스트 1개 이상 + 비교표 1개 이상 포함되었는가? (10점)
9. [키워드] 롱테일 키워드 '{longtail}'이 제목/첫문단/소제목에 자연스럽게 녹아있는가? (10점)
10. [분량] 최소 1500자 이상이며, 문단이 150~300단어 이내로 청킹되었는가? (10점)

JSON 형식:
{{
  "score": 75,
  "improved_content": "개선된 전체 본문 (마크다운, tags 줄 포함)"
}}

초고:
---
{draft}
---"""
    raw = _chat(model, system, user, temperature=0.4, timeout=400)

    score = 70
    improved = draft

    # JSON 파싱 시도 — LLM이 ```json 펜스로 감쌀 수 있으므로 제거
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        m = re.search(r"\{[\s\S]+\}", cleaned)
        if m:
            data = json.loads(m.group())
            score = int(data.get("score", 70))
            content = data.get("improved_content", "")
            # 개선 내용이 원본의 60% 미만이면 truncation으로 인한 손실로 판단 → 원본 유지
            if content and len(content) > 200 and len(content) >= len(draft) * 0.6:
                improved = content
            elif content and len(content) > 200:
                log.warning("  개선 내용이 원본보다 짧아 원본 유지 (improved=%d chars, draft=%d chars)",
                            len(content), len(draft))
    except Exception:
        pass

    # fallback: JSON 파싱 실패 시 raw에서 마크다운만 추출
    if improved == draft and len(raw) > 300:
        # raw가 JSON 래핑 없이 순수 마크다운일 수 있음
        stripped = re.sub(r"^```(?:json|markdown)?\s*", "", raw.strip(), flags=re.IGNORECASE)
        stripped = re.sub(r"\s*```$", "", stripped)
        # JSON 구조가 아닌 순수 마크다운이면 사용
        if not stripped.lstrip().startswith("{") and "##" in stripped:
            improved = stripped

    # 최종 안전장치: improved에 JSON 잔재가 남아있으면 제거
    if improved.lstrip().startswith("{") and '"improved_content"' in improved[:200]:
        try:
            data = json.loads(re.search(r"\{[\s\S]+\}", improved).group())  # type: ignore
            improved = data.get("improved_content", draft)
        except Exception:
            improved = draft

    score = max(0, min(100, score))
    log.info("  품질 점수: %d/100", score)
    _stage_done("quality", t0, extra=f"score={score}")
    return improved, score


# ══════════════════════════════════════════════════════════════
# Stage 5 · SEO 최적화
# ══════════════════════════════════════════════════════════════

def stage_seo(topic: dict, content: str, analysis: dict, model: str,
              product_count: int = 0) -> dict:
    t0 = _stage_start("seo")
    system = (
        "당신은 2026년 구글 SEO 및 GEO에 정통한 한국어 메타데이터 전문가입니다. "
        "독자의 감정을 건드리는 제목과 AI가 인용할 수 있는 메타 설명을 생성합니다."
    )
    longtail = analysis.get('longtail_keyword', '')
    emotional = analysis.get('emotional_hook', '실패 없는')
    count_note = f"\n중요: 상품 {product_count}개 소개됨. TOP N은 {product_count} 이하로." if product_count > 0 else ""
    user = f"""원본 제목: {topic['title']}
카테고리: {topic['category']}
타깃 페르소나: {analysis.get('target_buyer', '')}
롱테일 키워드: {longtail}
감정 유발 표현: {emotional}
{count_note}

본문 앞부분:
{content[:500]}

아래 JSON 형식으로만 응답하세요:
{{
  "seo_title": "감정 유발 + 롱테일 키워드 포함 제목 (40~60자, 예: '{emotional} {longtail} 비교 가이드 (2026)')",
  "meta_description": "검색 결과 설명 (80~120자, 독자 고민을 건드리는 문장 + 해결 힌트)",
  "focus_keyword": "롱테일 키워드 1개 (예: {longtail})",
  "secondary_keywords": ["연관 키워드1", "연관 키워드2", "연관 키워드3"],
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "slug_suggestion": "영문-소문자-하이픈 (예: airfryer-guide-2026)"
}}"""
    raw = _chat(model, system, user, temperature=0.3)
    seo: dict = {}
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        if m:
            seo = json.loads(m.group())
    except Exception:
        pass

    # content의 tags 줄 백업
    tag_match = re.search(r"tags?:\s*(.+)$", content, re.IGNORECASE | re.MULTILINE)
    if tag_match and not seo.get("tags"):
        seo["tags"] = [t.strip() for t in tag_match.group(1).split(",") if t.strip()]

    log.info("  SEO 제목: %s", seo.get("seo_title", "-"))
    log.info("  대표 키워드: %s", seo.get("focus_keyword", "-"))
    _stage_done("seo", t0)
    return seo


# ══════════════════════════════════════════════════════════════
# 결과 조립 & Supabase 저장
# ══════════════════════════════════════════════════════════════

def _strip_non_korean(text: str) -> str:
    """LLM이 혼입하는 비한국어 스크립트 제거 (한글·영문·숫자·기호·마크다운만 유지)"""
    # CJK Unified Ideographs (중국어 한자) 제거
    text = re.sub(r"[\u4e00-\u9fff]+", "", text)
    # 일본어 히라가나/카타카나 제거
    text = re.sub(r"[\u3040-\u30ff]+", "", text)
    # 키릴 문자 (러시아어 등) 제거
    text = re.sub(r"[\u0400-\u04ff]+", "", text)
    # 아랍 문자 제거
    text = re.sub(r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]+", "", text)
    # 태국어 제거
    text = re.sub(r"[\u0e00-\u0e7f]+", "", text)
    # 데바나가리 (힌디어 등) 제거
    text = re.sub(r"[\u0900-\u097f]+", "", text)
    # 기타 비라틴/비한글 스크립트 (그루지아, 아르메니아, 히브리 등) 제거
    text = re.sub(r"[\u0530-\u058f\u0590-\u05ff\u10a0-\u10ff]+", "", text)
    # 전체가 비한글인 줄 제거 (한글이 하나도 없고 영문/숫자/공백/기호만 있는 줄은 유지)
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        stripped = line.strip()
        # 빈 줄, 마크다운 기호로 시작하는 줄, 한글 포함 줄, 영문/숫자/기호만 있는 줄은 유지
        if (not stripped
                or re.search(r"[가-힣ㄱ-ㅎㅏ-ㅣ]", stripped)
                or re.match(r"^[a-zA-Z0-9\s\-_.,!?:;\'\"()\[\]{}<>/@#$%^&*+=~`|\\/#*>]+$", stripped)):
            cleaned.append(line)
    text = "\n".join(cleaned)
    # 연속 공백 정리 (줄 내부만, 마크다운 후행 더블스페이스 보존)
    text = re.sub(r"(?<!\n)  +(?!\s*$)", " ", text)
    return text.strip()

def assemble(topic: dict, content: str, seo: dict,
             affiliate_url: str = "", product_image: str = "") -> dict:
    # JSON 래핑 잔재 제거 (LLM이 ```json { "improved_content": "..." } ``` 로 반환한 경우)
    stripped = content.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json|markdown)?\s*", "", stripped, flags=re.IGNORECASE)
        stripped = re.sub(r"\s*```$", "", stripped)
    if stripped.lstrip().startswith("{") and '"improved_content"' in stripped[:300]:
        try:
            data = json.loads(re.search(r"\{[\s\S]+\}", stripped).group())  # type: ignore
            stripped = data.get("improved_content", content)
        except Exception:
            pass
    clean = re.sub(r"\ntags?:.*$", "", stripped, flags=re.IGNORECASE | re.MULTILINE).rstrip()
    clean = re.sub(r"^# .+\n?", "", clean).strip()
    clean = _strip_non_korean(clean)
    summary_match = re.match(r"^(.+?)(?:\n|$)", clean.strip())
    summary = summary_match.group(1).strip() if summary_match else topic["title"]
    return {
        "title":         _strip_non_korean(seo.get("seo_title") or topic["title"]),
        "summary":       _strip_non_korean(seo.get("meta_description") or summary[:300]),
        "content":       clean,
        "content_html":  md_to_html(clean),
        "tags":          seo.get("tags", []),
        "focus_keyword": seo.get("focus_keyword", ""),
        "category":      topic["category"],  # 사이트 카테고리와 동일
        "affiliate_url": affiliate_url,
        "product_image": product_image,
    }

def save_to_supabase(topic: dict, assembled: dict, slug: str, quality_score: int) -> None:
    record = {
        "slug":          slug,
        "title":         assembled["title"],
        "summary":       assembled["summary"],
        "content":       assembled["content"],
        "content_html":  assembled["content_html"],
        "tags":          assembled["tags"],
        "category":      assembled["category"],
        "status":        "published",
        "source":        "auto",
        "topic_key":     topic["key"],
        "created_at":    datetime.utcnow().isoformat(),
    }
    if assembled.get("affiliate_url"):
        record["affiliate_url"] = assembled["affiliate_url"]
    if assembled.get("product_image"):
        record["product_image"] = assembled["product_image"]
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/blog_posts",
        headers={
            "apikey":        SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type":  "application/json",
            "Prefer":        "return=representation",
        },
        json=record,
        timeout=15,
    )
    resp.raise_for_status()
    log.info("[DB] 저장 완료: /blog/%s (score=%d, category=%s)", slug, quality_score, assembled["category"])


# ══════════════════════════════════════════════════════════════
# 유효성 검사
# ══════════════════════════════════════════════════════════════

def validate_env() -> None:
    missing = []
    if not SUPABASE_URL:
        missing.append("NEXT_PUBLIC_SUPABASE_URL")
    if not SUPABASE_KEY:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        log.error("필수 환경변수 누락: %s", ", ".join(missing))
        sys.exit(1)
    if not COUPANG_ACCESS_KEY or not COUPANG_SECRET_KEY:
        log.warning("[쿠팡] COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY 미설정 — 상품 데이터 없이 실행")

def validate_ollama(model: str) -> None:
    try:
        requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5).raise_for_status()
    except Exception as e:
        log.error("[Ollama] 연결 실패 (%s): %s", OLLAMA_BASE_URL, e)
        sys.exit(1)
    log.info("[Ollama] 선택 모델: %s", model)


# ══════════════════════════════════════════════════════════════
# 파이프라인 실행
# ══════════════════════════════════════════════════════════════

def run_pipeline(
    topic: dict,
    model: str,
    dry_run: bool = False,
    resume_stage: Optional[str] = None,
) -> dict:
    STAGE_ORDER = ["products", "topic", "outline", "write", "quality", "seo"]
    state = load_state() if resume_stage else {}
    t_total = time.time()

    resume_idx = STAGE_ORDER.index(resume_stage) if resume_stage in STAGE_ORDER else 0

    # Stage 0: 쿠팡 상품 수집
    if resume_idx <= 0 or "products" not in state:
        products = stage_products(topic)
        state["products"] = [
            {
                "product_name":   p.product_name,
                "product_price":  p.product_price,
                "original_price": p.original_price,
                "discount_rate":  p.discount_rate,
                "rating":         p.rating,
                "rating_count":   p.rating_count,
                "product_image":  p.product_image,
                "product_url":    p.product_url,
                "is_rocket":      p.is_rocket,
            }
            for p in products
        ] if products else []
        save_state(state)
    else:
        # 재개 시 저장된 상품 데이터 복원
        products = []
        if _COUPANG_AVAILABLE:
            from coupang_api import CoupangProduct
            for d in state.get("products", []):
                try:
                    products.append(CoupangProduct(**d))
                except Exception:
                    pass
        _emit("[PIPELINE:stage=products:status=skipped]")

    # 대표 상품 선정 (affiliate_url, product_image 확보)
    best = pick_best_product(products) if products and _COUPANG_AVAILABLE else None
    affiliate_url = best.product_url    if best else ""
    product_image = best.product_image  if best else ""
    if best:
        log.info("  대표 상품: %s (★%.1f, %s원)",
                 best.product_name[:40], best.rating, f"{best.product_price:,}")

    # Stage 1: 토픽 분석
    if resume_idx <= 1 or "analysis" not in state:
        analysis = stage_topic(topic, model)
        state.update({"topic": topic, "analysis": analysis})
        save_state(state)
    else:
        topic    = state.get("topic", topic)
        analysis = state["analysis"]
        _emit("[PIPELINE:stage=topic:status=skipped]")

    # Stage 2: 아웃라인
    if resume_idx <= 2 or "outline" not in state:
        outline = stage_outline(topic, analysis, model)
        state["outline"] = outline
        save_state(state)
    else:
        outline = state["outline"]
        _emit("[PIPELINE:stage=outline:status=skipped]")

    # Stage 3+4: 본문 작성 (품질 미달 시 재시도)
    quality_score = 0
    improved      = ""
    for attempt in range(1, MAX_WRITE_RETRY + 2):
        if attempt == 1 and resume_idx <= 3 or "draft" not in state:
            draft = stage_write(topic, analysis, outline, model,
                                products=products, attempt=attempt)
            state["draft"] = draft
            save_state(state)
        else:
            draft = state["draft"]
            _emit("[PIPELINE:stage=write:status=skipped]")

        if attempt == 1 and resume_idx <= 4 or "improved" not in state:
            improved, quality_score = stage_quality(draft, analysis, model)
            state["improved"]       = improved
            state["quality_score"]  = quality_score
            save_state(state)
        else:
            improved      = state["improved"]
            quality_score = state.get("quality_score", 70)
            _emit("[PIPELINE:stage=quality:status=skipped]")

        if quality_score >= MIN_QUALITY_SCORE or attempt >= MAX_WRITE_RETRY + 1:
            break

        log.info("  품질 미달 (score=%d < %d) — 재작성 시도 %d",
                 quality_score, MIN_QUALITY_SCORE, attempt + 1)
        state.pop("draft", None)
        state.pop("improved", None)

    # Stage 5: SEO
    seo = stage_seo(topic, improved, analysis, model,
                    product_count=len(products) if products else 0)
    state["seo"] = seo
    save_state(state)

    assembled = assemble(topic, improved, seo,
                         affiliate_url=affiliate_url, product_image=product_image)
    elapsed   = round(time.time() - t_total, 1)

    _emit(f"[PIPELINE:done:score={quality_score}:elapsed={elapsed}:topic={topic['key']}]")

    if dry_run:
        print("\n" + "═" * 65)
        print(f"  모델     : {model}")
        print(f"  제목     : {assembled['title']}")
        print(f"  슬러그   : {slugify(assembled['title'])}")
        print(f"  카테고리 : {assembled['category']}")
        print(f"  키워드   : {seo.get('focus_keyword', '-')}")
        print(f"  태그     : {', '.join(assembled['tags'])}")
        print(f"  품질점수 : {quality_score}/100")
        print(f"  요약     : {assembled['summary']}")
        print(f"  상품링크 : {assembled['affiliate_url'] or '없음'}")
        print(f"  상품이미지: {assembled['product_image'] or '없음'}")
        print(f"  소요시간 : {elapsed}s")
        print("─" * 65)
        print(assembled["content"][:1000], "\n…")
    else:
        # SEO 단계에서 생성한 영문 slug 우선 사용, 없으면 topic key fallback
        raw_slug = seo.get("slug_suggestion") or topic.get("key", "") or slugify(assembled["title"])
        slug = unique_slug(slugify(raw_slug))
        save_to_supabase(topic, assembled, slug, quality_score)
        _save_history(topic["key"])
        log.info("[완료] /blog/%s (score=%d, %.1fs, affiliate=%s)",
                 slug, quality_score, elapsed, "✓" if affiliate_url else "✗")
        assembled["slug"] = slug

    assembled["quality_score"] = quality_score
    return assembled


# ══════════════════════════════════════════════════════════════
# 메인
# ══════════════════════════════════════════════════════════════

def main() -> None:
    global _PIPELINE_MODE

    parser = argparse.ArgumentParser(description="ThiveLab 쿠팡 파트너스 리뷰 자동 생성기")
    parser.add_argument("--count",         type=int,  default=1,  help="생성 개수 (기본: 1)")
    parser.add_argument("--dry-run",       action="store_true",   help="저장 없이 출력만")
    parser.add_argument("--pipeline-mode", action="store_true",   help="구조화 마커 출력")
    parser.add_argument("--stage",         type=str,  default=None,
                        choices=["products", "topic", "outline", "write", "quality", "seo"],
                        help="특정 스테이지부터 재실행")
    parser.add_argument("--category",      type=str,  default=None,
                        choices=SITE_CATEGORIES,
                        help="특정 카테고리만 생성")
    parser.add_argument("--trend",         action="store_true",
                        help="Google Trends 기반 실시간 트렌드 토픽으로 생성")
    args = parser.parse_args()

    _PIPELINE_MODE = args.pipeline_mode

    if not args.dry_run:
        validate_env()

    available = get_available_models()
    if not available:
        log.error("[Ollama] 사용 가능한 채팅 모델이 없습니다.")
        sys.exit(1)

    model = select_best_model(available)
    validate_ollama(model)

    log.info("사용 가능한 모델: %s", available)
    log.info("선택된 모델: %s", model)
    if args.category:
        log.info("카테고리 필터: %s", args.category)
    _emit(f"[PIPELINE:model={model}]")

    # ── 트렌드 모드: 토픽 목록 미리 수집 ─────────────────────────
    trend_topics: list[dict] = []
    if args.trend:
        if not _TRENDS_AVAILABLE:
            log.error("[Trends] trend_fetcher 모듈 없음 — pip install pytrends")
            sys.exit(1)
        log.info("[Trends] Google Trends 관심도 분석 중...")
        trend_topics = get_trending_topics(
            category_filter=args.category,
            limit=max(args.count, 5),
            all_topics=TOPICS,
        )
        if not trend_topics:
            log.warning("[Trends] 매핑된 트렌드 없음 — 고정 TOPICS 로 fallback")
        else:
            log.info("[Trends] 사용할 트렌드 토픽 %d개:", len(trend_topics))
            for t in trend_topics[:args.count]:
                score_str = f" (관심도 {t['trend_score']})" if t.get("trend_score") else ""
                log.info("  · [%s] %s%s", t["category"], t["search_keyword"], score_str)

    for i in range(args.count):
        if i > 0:
            time.sleep(5)

        # 트렌드 모드면 trend_topics 에서, 없으면 고정 TOPICS 에서
        if args.trend and trend_topics:
            topic = trend_topics[i % len(trend_topics)]
        else:
            topic = pick_topic(category_filter=args.category)

        log.info("\n[%d/%d] 토픽: %s (%s)%s",
                 i + 1, args.count, topic["title"], topic["category"],
                 " [TREND]" if topic.get("is_trend") else "")
        _emit(f"[PIPELINE:topic_title={topic['title']}]")
        run_pipeline(topic, model, dry_run=args.dry_run, resume_stage=args.stage)


if __name__ == "__main__":
    main()
