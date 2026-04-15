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
        "당신은 한국 쇼핑 트렌드와 소비자 심리에 정통한 콘텐츠 전략가입니다. "
        "주어진 상품 카테고리를 분석해 구매 전환율 높은 큐레이션 가이드 전략을 JSON으로 제안합니다. "
        "중요: 이 사이트는 '직접 사용 리뷰'가 아니라 쿠팡 실구매자 평점·리뷰·스펙 데이터를 분석하는 '추천 가이드' 사이트입니다."
    )
    user = f"""추천 가이드 주제: {topic['title']}
카테고리: {topic['category']}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{{
  "angle": "이 가이드의 핵심 차별화 포인트 (비교표, 체크리스트, TOP N 등)",
  "target_buyer": "주요 구매 타깃 (예: 1인 가구 30대, 육아 중인 부모 등)",
  "purchase_pain": "구매 전 가장 많이 고민하는 것 1문장",
  "review_focus": "이 가이드에서 가장 강조할 비교 기준 3가지 (쉼표 구분)",
  "tone": "글의 톤 (예: 친절한 큐레이터, 데이터 분석가, 상품 전문가)"
}}"""
    raw = _chat(model, system, user, temperature=0.5)
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        analysis = json.loads(m.group()) if m else {}
    except Exception:
        analysis = {
            "angle": "쿠팡 평점 기반 가성비 비교 가이드",
            "target_buyer": "일반 소비자",
            "purchase_pain": "어떤 제품을 골라야 할지 모르겠다",
            "review_focus": "가격, 쿠팡 평점, 리뷰 수",
            "tone": "친절한 큐레이터",
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
        "당신은 한국 쇼핑 큐레이션 전문 에디터입니다. "
        "독자가 제품 비교를 쉽게 하고 구매 결정을 내릴 수 있도록 가이드를 설계합니다. "
        "중요: '직접 사용해봤다'는 표현 금지. 쿠팡 실구매자 데이터/스펙/가격 기반 비교 분석입니다."
    )
    user = f"""추천 가이드 주제: {topic['title']}
카테고리: {topic['category']}
타깃 구매자: {analysis.get('target_buyer', '')}
구매 고민: {analysis.get('purchase_pain', '')}
비교 기준: {analysis.get('review_focus', '')}

"사용자의 고민 제시 → 해결책/정보 제공 → 쿠팡 상품 추천" 흐름으로 아웃라인을 작성하세요:
- H2 섹션 1: [문제 제기] 독자의 핵심 고민을 Q&A 형태로 시작 (예: "Q: 에어프라이어, 10만원 이하로 괜찮은 게 있을까?")
- H2 섹션 2: [정보 제공] 선택 기준/체크리스트/비교 기준 안내
- H2 섹션 3: [상품 추천] 수집된 쿠팡 상품 비교표 (모든 상품 개별 소개)
- H2 섹션 4: [가격대별 정리] 예산별 추천
- H2 섹션 5: [최종 가이드] 추천 대상 / 패스 대상
- 각 섹션에 구체적 내용 힌트 불릿 3개
- 반드시 비교표 또는 TOP N 형식의 섹션 1개 포함"""
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

    system = (
        f"당신은 {analysis.get('tone', '친절한 큐레이터')} 스타일의 한국 쇼핑 추천 가이드 작성자입니다. "
        "쿠팡 실구매자 평점·리뷰 수·스펙·가격 데이터를 분석해 비교 가이드를 작성합니다. "
        "절대 금지: '직접 써봤다', '사용해봤다', '구매했다' 등 1인칭 사용 경험 표현. "
        "대신 '쿠팡 구매자 리뷰에 따르면', '스펙을 비교해 보면', '평점 데이터 기준으로' 같은 객관적 표현을 사용합니다. "
        "도입부 첫 문단은 반드시 'Q: [핵심 질문]' + 'A: [즉답 1~2문장]' 형태로 시작하세요. "
        "AI 검색엔진이 이 즉답을 인용할 수 있도록, 질문에 대한 명확하고 구체적인 답변을 먼저 제시한 뒤 상세 설명으로 이어가세요."
    )
    user = f"""추천 가이드 주제: {topic['title']}
카테고리: {topic['category']}
타깃 구매자: {analysis.get('target_buyer', '')}
비교 기준: {analysis.get('review_focus', '')}
{product_context}
아웃라인:
{outline}

작성 규칙:
- 총 600~900 단어
- 도입부: Q&A 즉답 구조 필수 (예: "Q: 민감 피부에 좋은 세탁세제는? A: 쿠팡 데이터 기준, 무향·무형광 성분의 [제품명]이 평점 4.5 이상으로 가장 높은 만족도를 보입니다.")
- 마크다운 형식 필수 — 제목(##), 리스트(-), 테이블(|), 강조(**) 활용
- 구체적 수치 포함 (가격대, 용량, 무게, 쿠팡 평점, 리뷰 수 등)
- 수집된 상품 {len(products) if products else 0}개를 각각 개별 소개 (제품명, 가격, 핵심 특징, 추천 대상)
- "이런 분께 추천 / 이런 분은 패스" 형태로 구매 가이드 제공
- 절대 금지: "제가 직접 써봤는데", "사용해보니", "구매해서 써봤습니다" 등 1인칭 체험 표현
- 절대 금지: 수집된 상품 수보다 많은 수의 TOP N 제목 사용 (예: 상품 5개인데 베스트 금지)
- 대신 사용: "쿠팡 평점 4.5 이상", "리뷰 1000개 이상인 인기 제품", "스펙 비교 결과"{"" if not products else chr(10) + "- 위 쿠팡 상품 " + str(len(products)) + "개의 실제 제품명·가격·평점을 모두 개별 소개할 것 (하나도 빠뜨리지 말 것)"}
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
        "당신은 쇼핑 큐레이션 전문 에디터입니다. "
        "초고를 검토하고 구매 전환율을 높이는 방향으로 개선 후 점수를 반환합니다. "
        "특히 '직접 사용해봤다' 같은 1인칭 체험 표현이 있으면 반드시 제거하고 "
        "'쿠팡 구매자 리뷰에 따르면', '스펙 비교 기준' 같은 객관적 표현으로 교체합니다."
    )
    user = f"""타깃 구매자: {analysis.get('target_buyer', '일반 소비자')}

아래 기준으로 초고를 검토하고 개선된 최종본을 작성한 뒤 JSON으로 반환하세요.

검토 기준 (각 20점):
1. 첫 문단이 독자를 즉시 붙잡는가?
2. 구체적 수치/스펙/쿠팡 평점이 충분히 포함되었는가?
3. 객관적 톤인가? ('직접 써봤다' 같은 1인칭 체험 표현이 없는가?)
4. 추천 대상이 명확하게 안내되었는가?
5. 가독성 (단락 구분, 비교표 형식, 문장 길이)이 적절한가?

JSON 형식:
{{
  "score": 75,
  "improved_content": "개선된 전체 본문 (마크다운, tags 줄 포함)"
}}

초고:
---
{draft[:3000]}
---"""
    raw = _chat(model, system, user, temperature=0.4, timeout=400)

    score = 70
    improved = draft
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        if m:
            data = json.loads(m.group())
            score = int(data.get("score", 70))
            improved = data.get("improved_content") or draft
    except Exception:
        improved = raw if len(raw) > 200 else draft

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
        "당신은 한국어 SEO 전문가입니다. "
        "쇼핑 추천 가이드에 최적화된 메타데이터를 JSON으로 생성합니다."
    )
    count_note = f"\n중요: 본문에서 실제 소개된 상품은 {product_count}개입니다. 제목에 TOP N을 넣을 경우 반드시 {product_count} 이하의 숫자를 사용하세요. 상품이 5개인데 베스트이라고 쓰면 안 됩니다." if product_count > 0 else ""
    user = f"""원본 제목: {topic['title']}
카테고리: {topic['category']}
타깃 구매자: {analysis.get('target_buyer', '')}
{count_note}

본문 앞부분:
{content[:500]}

아래 JSON 형식으로만 응답하세요:
{{
  "seo_title": "검색 최적화 제목 (40~60자, '추천'·'비교'·'가이드' 등 키워드 포함{f', TOP N은 {product_count} 이하' if product_count else ''})",
  "meta_description": "검색 결과 설명 (80~120자, 구매 유도 문구 포함)",
  "focus_keyword": "대표 검색 키워드 1개 (예: 에어프라이어 추천)",
  "secondary_keywords": ["연관 키워드1", "연관 키워드2", "연관 키워드3"],
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "slug_suggestion": "영문-소문자-하이픈 (예: airfryer-review-2026)"
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
    # 연속 공백 정리
    text = re.sub(r"  +", " ", text)
    return text.strip()

def assemble(topic: dict, content: str, seo: dict,
             affiliate_url: str = "", product_image: str = "") -> dict:
    clean = re.sub(r"\ntags?:.*$", "", content, flags=re.IGNORECASE | re.MULTILINE).rstrip()
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

    for i in range(args.count):
        if i > 0:
            time.sleep(5)
        topic = pick_topic(category_filter=args.category)
        log.info("\n[%d/%d] 토픽: %s (%s)", i + 1, args.count, topic["title"], topic["category"])
        _emit(f"[PIPELINE:topic_title={topic['title']}]")
        run_pipeline(topic, model, dry_run=args.dry_run, resume_stage=args.stage)


if __name__ == "__main__":
    main()
