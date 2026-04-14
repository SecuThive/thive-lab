#!/usr/bin/env python3
"""
ThiveLab Auto Blog Generator — Multi-Stage Pipeline v2

Stage 1 · topic    : 토픽 선정 + 독자·각도 분석
Stage 2 · outline  : 섹션별 상세 아웃라인 생성
Stage 3 · write    : 아웃라인 기반 본문 작성
Stage 4 · quality  : 가독성·깊이·정확성 검토 + 품질 스코어 (0-100)
Stage 5 · seo      : 제목 / 메타 / 슬러그 / 키워드 최적화

Usage:
    python blog_generator.py              # 1개 생성 (전체 파이프라인)
    python blog_generator.py --count 3    # 3개 생성
    python blog_generator.py --dry-run    # 저장 없이 출력만
    python blog_generator.py --stage seo  # 특정 스테이지부터 재실행 (캐시 활용)
    python blog_generator.py --pipeline-mode  # 구조화된 마커 출력 (blog_queue 사용)
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

SUPABASE_URL    = (os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY    = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
OLLAMA_BASE_URL = (os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
BLOG_LLM_MODEL  = os.getenv("BLOG_LLM_MODEL", "gemma4:e4b")

# ── 로깅 ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── 파이프라인 모드 플래그 (blog_queue 워커가 활성화) ──────────
_PIPELINE_MODE = False

def _emit(marker: str) -> None:
    """파이프라인 마커 출력 (pipeline-mode일 때만)"""
    if _PIPELINE_MODE:
        print(marker, flush=True)

# ── 모델 품질 우선순위 ─────────────────────────────────────────
MODEL_PRIORITY = [
    "llama3.3", "llama3.2", "llama3.1", "llama3",
    "deepseek-r1", "deepseek-v3",
    "qwen2.5:72b", "qwen2.5:32b", "qwen2.5:14b", "qwen2.5:7b", "qwen2.5",
    "mistral-large", "mistral-nemo", "mistral",
    "gemma3:27b", "gemma3:12b", "gemma3:4b", "gemma3",
    "gemma4:27b", "gemma4:12b", "gemma4:e4b", "gemma4",
    "phi4", "phi3",
    "solar", "command-r-plus", "command-r",
]

STATE_FILE   = Path(__file__).parent / ".pipeline_state.json"
HISTORY_FILE = Path(__file__).parent / ".blog_history.json"
HISTORY_KEEP = 15

# ── 최소 품질 점수 (이 미만이면 write 스테이지 재시도) ──────────
MIN_QUALITY_SCORE = 65
MAX_WRITE_RETRY   = 2

# ── 토픽 목록 ─────────────────────────────────────────────────
TOPICS = [
    # AI / LLM
    {"key": "llm_prompt_engineering",  "title": "LLM 프롬프트 엔지니어링 실전 가이드",              "category": "AI"},
    {"key": "ai_agent_tools",          "title": "2025년 AI 에이전트 도구 비교: LangChain vs CrewAI", "category": "AI"},
    {"key": "rag_pipeline",            "title": "RAG 파이프라인 구축 완전 정복",                     "category": "AI"},
    {"key": "llm_finetuning_intro",    "title": "비용 없이 LLM 파인튜닝하는 법 (LoRA 활용)",        "category": "AI"},
    {"key": "local_llm_ollama",        "title": "Ollama로 로컬 LLM 서버 세팅하기",                  "category": "AI"},
    # 인디해커 / 마이크로 SaaS
    {"key": "indie_mrr_100",           "title": "MRR $100 달성하는 마이크로 SaaS 전략",             "category": "Indie"},
    {"key": "supabase_mvp",            "title": "Supabase로 MVP 24시간 안에 만들기",                 "category": "Indie"},
    {"key": "nextjs_saas_boilerplate", "title": "Next.js SaaS 보일러플레이트 완전 해부",             "category": "Dev"},
    {"key": "stripe_subscription",     "title": "Stripe 구독 결제 연동 실전 노트",                   "category": "Dev"},
    {"key": "vercel_edge_functions",   "title": "Vercel Edge Functions 활용 패턴 모음",              "category": "Dev"},
    # 자동화
    {"key": "python_automation_2025",  "title": "파이썬으로 반복 업무 자동화하는 7가지 방법",        "category": "Automation"},
    {"key": "github_actions_ci",       "title": "GitHub Actions로 CI/CD 파이프라인 5분 설정",        "category": "DevOps"},
    {"key": "cron_job_patterns",       "title": "서버리스 크론 잡 설계 패턴 (Vercel Cron 포함)",     "category": "DevOps"},
    {"key": "playwright_scraping",     "title": "Playwright 기반 스크레이핑 완전 가이드",             "category": "Automation"},
    # 개발자 성장
    {"key": "open_source_contrib",     "title": "오픈소스 기여로 포트폴리오 만드는 법",              "category": "Growth"},
    {"key": "side_project_launch",     "title": "사이드 프로젝트 론칭 체크리스트 25가지",            "category": "Growth"},
    {"key": "technical_writing",       "title": "기술 블로그 잘 쓰는 개발자들의 공통점",             "category": "Growth"},
    # 보안
    {"key": "supabase_rls",            "title": "Supabase RLS 정책 완전 정복",                       "category": "Security"},
    {"key": "api_security_basics",     "title": "REST API 보안 기초: 개발자가 꼭 알아야 할 것들",    "category": "Security"},
    {"key": "jwt_auth_patterns",       "title": "JWT 인증 구현 패턴과 흔한 실수",                    "category": "Security"},
    # 데이터 / ETL
    {"key": "supabase_realtime",       "title": "Supabase Realtime으로 실시간 대시보드 만들기",      "category": "Data"},
    {"key": "steam_data_api",          "title": "Steam Web API 데이터 수집과 분석",                  "category": "Data"},
    {"key": "etl_python_patterns",     "title": "파이썬 ETL 파이프라인 설계 패턴",                   "category": "Data"},
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

def pick_topic() -> dict:
    recent = set(_load_history())
    pool = [t for t in TOPICS if t["key"] not in recent] or TOPICS
    return random.choice(pool)

def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")[:80]

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

def md_to_html(md: str) -> str:
    html = md
    html = re.sub(
        r"```(\w*)\n([\s\S]*?)```",
        lambda m: f'<pre><code class="language-{m.group(1)}">{m.group(2).rstrip()}</code></pre>',
        html,
    )
    html = re.sub(r"`([^`]+)`", r"<code>\1</code>", html)
    for n in range(4, 0, -1):
        html = re.sub(r"^" + "#" * n + r" (.+)$", rf"<h{n}>\1</h{n}>", html, flags=re.MULTILINE)
    html = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html)
    html = re.sub(r"\*(.+?)\*",     r"<em>\1</em>",         html)
    html = re.sub(r"^[-*] (.+)$",  r"<li>\1</li>",         html, flags=re.MULTILINE)
    html = re.sub(r"(<li>.*</li>)", r"<ul>\1</ul>",         html, flags=re.DOTALL)
    html = re.sub(r"^---+$",        "<hr>",                  html, flags=re.MULTILINE)
    paragraphs = re.split(r"\n{2,}", html.strip())
    parts = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if p.startswith(("<h", "<ul", "<pre", "<hr")):
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
    return resp.json()["message"]["content"].strip()


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
# Stage 헬퍼 — 진행 마커 출력
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
# Stage 1 · 토픽 분석
# ══════════════════════════════════════════════════════════════

def stage_topic(topic: dict, model: str) -> dict:
    t0 = _stage_start("topic")
    log.info("  토픽: %s", topic["title"])
    system = (
        "당신은 한국 개발자 커뮤니티 트렌드에 정통한 콘텐츠 전략가입니다. "
        "주어진 주제를 분석해 최적의 글쓰기 각도와 독자층을 JSON으로 제안합니다."
    )
    user = f"""주제: {topic['title']}
카테고리: {topic['category']}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{{
  "angle": "이 글의 핵심 접근 각도",
  "target_audience": "주요 독자층",
  "pain_point": "독자가 겪는 핵심 고통/궁금증 1문장",
  "unique_hook": "다른 글과 차별화되는 이 글만의 특징 1문장",
  "tone": "글의 톤앤매너"
}}"""
    raw = _chat(model, system, user, temperature=0.5)
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        analysis = json.loads(m.group()) if m else {}
    except Exception:
        analysis = {"angle": "실전 가이드", "target_audience": "개발자", "pain_point": "", "unique_hook": "", "tone": "친근한"}
    log.info("  각도: %s | 독자: %s", analysis.get("angle", "-"), analysis.get("target_audience", "-"))
    _stage_done("topic", t0)
    return analysis


# ══════════════════════════════════════════════════════════════
# Stage 2 · 아웃라인 생성
# ══════════════════════════════════════════════════════════════

def stage_outline(topic: dict, analysis: dict, model: str) -> str:
    t0 = _stage_start("outline")
    system = (
        "당신은 한국어 기술 블로그 전문 에디터입니다. "
        "독자의 이탈을 막는 논리적 구조의 아웃라인을 작성합니다."
    )
    user = f"""주제: {topic['title']}
각도: {analysis.get('angle', '')}
독자: {analysis.get('target_audience', '')}
고통점: {analysis.get('pain_point', '')}
차별점: {analysis.get('unique_hook', '')}

아래 규칙으로 아웃라인을 작성하세요:
- H2 섹션 4~5개
- 각 섹션에 불릿 3~4개 (구체적 내용 힌트)
- 코드 예시가 들어갈 섹션 1~2개 명시 [코드 포함]
- 마지막 섹션은 핵심 정리/액션 아이템"""
    outline = _chat(model, system, user, temperature=0.6)
    sections = outline.count("## ")
    log.info("  섹션 수: %d", sections)
    _stage_done("outline", t0)
    return outline


# ══════════════════════════════════════════════════════════════
# Stage 3 · 본문 작성
# ══════════════════════════════════════════════════════════════

def stage_write(topic: dict, analysis: dict, outline: str, model: str, attempt: int = 1) -> str:
    t0 = _stage_start("write")
    if attempt > 1:
        log.info("  재시도 %d/%d", attempt, MAX_WRITE_RETRY + 1)
    system = (
        f"당신은 {analysis.get('tone', '친근한 선배 개발자')} 스타일의 한국 테크 블로거입니다. "
        "아웃라인을 바탕으로 실제 코드와 구체적 수치가 담긴 완성도 높은 글을 마크다운으로 작성합니다. "
        "서론 없이 첫 문장부터 핵심을 말합니다."
    )
    user = f"""주제: {topic['title']}
독자: {analysis.get('target_audience', '')}
차별점: {analysis.get('unique_hook', '')}

아웃라인:
{outline}

작성 규칙:
- 총 700~1000 단어
- 각 섹션은 아웃라인의 힌트를 모두 반영
- [코드 포함] 섹션에는 반드시 실제 동작하는 코드 블록 포함
- 추상적 표현 금지 — 구체적 예시, 수치, 도구명 사용
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
    """개선된 본문과 품질 스코어 (0-100) 반환"""
    t0 = _stage_start("quality")
    system = (
        "당신은 기술 블로그 전문 에디터입니다. "
        "초고를 검토하고 품질을 높여 최종본과 점수를 반환합니다."
    )
    user = f"""독자: {analysis.get('target_audience', '개발자')}

아래 기준으로 초고를 검토하고 개선된 최종본을 작성한 뒤, JSON 형식으로 반환하세요.

검토 기준 (각 20점):
1. 첫 문장이 즉시 핵심을 전달하는가?
2. 섹션 간 논리적 연결이 자연스러운가?
3. 코드 예시가 실제 동작 가능한 수준인가?
4. 추상적·진부한 표현이 없는가?
5. 가독성 (문장 길이, 단락 구분)이 적절한가?

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

    # JSON 파싱 시도
    score = 70
    improved = draft
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        if m:
            data = json.loads(m.group())
            score = int(data.get("score", 70))
            improved = data.get("improved_content") or draft
    except Exception:
        # JSON 파싱 실패 시 raw 전체를 개선본으로 처리
        improved = raw if len(raw) > 200 else draft

    score = max(0, min(100, score))
    log.info("  품질 점수: %d/100", score)
    _stage_done("quality", t0, extra=f"score={score}")
    return improved, score


# ══════════════════════════════════════════════════════════════
# Stage 5 · SEO 최적화
# ══════════════════════════════════════════════════════════════

def stage_seo(topic: dict, content: str, analysis: dict, model: str) -> dict:
    t0 = _stage_start("seo")
    system = (
        "당신은 한국어 SEO 전문가입니다. "
        "검색 트래픽을 극대화하는 메타데이터를 JSON으로 생성합니다."
    )
    user = f"""원본 제목: {topic['title']}
카테고리: {topic['category']}
독자: {analysis.get('target_audience', '')}

본문 (앞 500자):
{content[:500]}

아래 JSON 형식으로만 응답하세요:
{{
  "seo_title": "검색 노출용 최적화 제목 (40~60자, 핵심 키워드 포함)",
  "meta_description": "검색 결과 설명 (80~120자, 클릭을 유도하는 문장)",
  "focus_keyword": "이 글의 대표 검색 키워드 1개",
  "secondary_keywords": ["연관 키워드1", "연관 키워드2", "연관 키워드3"],
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "slug_suggestion": "영문-소문자-하이픈-형식"
}}"""
    raw = _chat(model, system, user, temperature=0.3)
    seo: dict = {}
    try:
        m = re.search(r"\{[\s\S]+\}", raw)
        if m:
            seo = json.loads(m.group())
    except Exception:
        pass

    # content tags 줄 백업
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

def assemble(topic: dict, content: str, seo: dict) -> dict:
    clean = re.sub(r"\ntags?:.*$", "", content, flags=re.IGNORECASE | re.MULTILINE).rstrip()
    clean = re.sub(r"^# .+\n?", "", clean).strip()
    summary_match = re.match(r"^(.+?)(?:\n|$)", clean.strip())
    summary = summary_match.group(1).strip() if summary_match else topic["title"]
    return {
        "title":         seo.get("seo_title") or topic["title"],
        "summary":       seo.get("meta_description") or summary[:300],
        "content":       clean,
        "content_html":  md_to_html(clean),
        "tags":          seo.get("tags", []),
        "focus_keyword": seo.get("focus_keyword", ""),
        "category":      topic["category"],
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
    log.info("[DB] 저장 완료: /blog/%s (score=%d)", slug, quality_score)


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

def validate_ollama(model: str) -> None:
    try:
        requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5).raise_for_status()
    except Exception as e:
        log.error("[Ollama] 연결 실패 (%s): %s", OLLAMA_BASE_URL, e)
        sys.exit(1)
    log.info("[Ollama] 모델: %s", model)


# ══════════════════════════════════════════════════════════════
# 파이프라인 실행
# ══════════════════════════════════════════════════════════════

def run_pipeline(topic: dict, model: str, dry_run: bool = False, resume_stage: Optional[str] = None) -> dict:
    """파이프라인을 실행하고 결과 dict 반환"""
    STAGE_ORDER = ["topic", "outline", "write", "quality", "seo"]
    state = load_state() if resume_stage else {}
    t_total = time.time()

    # ── Stage 1: 토픽 분석 ───────────────────────────────────
    resume_idx = STAGE_ORDER.index(resume_stage) if resume_stage in STAGE_ORDER else 0
    if resume_idx <= 0 or "analysis" not in state:
        analysis = stage_topic(topic, model)
        state.update({"topic": topic, "analysis": analysis})
        save_state(state)
    else:
        topic    = state.get("topic", topic)
        analysis = state["analysis"]
        _emit("[PIPELINE:stage=topic:status=skipped]")

    # ── Stage 2: 아웃라인 ────────────────────────────────────
    if resume_idx <= 1 or "outline" not in state:
        outline = stage_outline(topic, analysis, model)
        state["outline"] = outline
        save_state(state)
    else:
        outline = state["outline"]
        _emit("[PIPELINE:stage=outline:status=skipped]")

    # ── Stage 3: 본문 작성 (품질 미달 시 재시도) ───────────────
    quality_score = 0
    improved      = ""
    for attempt in range(1, MAX_WRITE_RETRY + 2):
        if attempt == 1 and resume_idx <= 2 or "draft" not in state:
            draft = stage_write(topic, analysis, outline, model, attempt=attempt)
            state["draft"] = draft
            save_state(state)
        else:
            draft = state["draft"]
            _emit("[PIPELINE:stage=write:status=skipped]")

        # ── Stage 4: 품질 검토 ────────────────────────────────
        if attempt == 1 and resume_idx <= 3 or "improved" not in state:
            improved, quality_score = stage_quality(draft, analysis, model)
            state["improved"]      = improved
            state["quality_score"] = quality_score
            save_state(state)
        else:
            improved      = state["improved"]
            quality_score = state.get("quality_score", 70)
            _emit("[PIPELINE:stage=quality:status=skipped]")

        # 품질 통과 or 마지막 시도면 종료
        if quality_score >= MIN_QUALITY_SCORE or attempt >= MAX_WRITE_RETRY + 1:
            break

        log.info("  품질 미달 (score=%d < %d) — 재작성 시도 %d",
                 quality_score, MIN_QUALITY_SCORE, attempt + 1)
        # 재시도 시 캐시 무효화
        state.pop("draft", None)
        state.pop("improved", None)

    # ── Stage 5: SEO ─────────────────────────────────────────
    seo = stage_seo(topic, improved, analysis, model)
    state["seo"] = seo
    save_state(state)

    assembled = assemble(topic, improved, seo)
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
        print(f"  소요시간 : {elapsed}s")
        print("─" * 65)
        print(assembled["content"][:1000], "\n…")
    else:
        slug = unique_slug(slugify(assembled["title"]))
        save_to_supabase(topic, assembled, slug, quality_score)
        _save_history(topic["key"])
        log.info("[완료] /blog/%s (score=%d, %.1fs)", slug, quality_score, elapsed)
        assembled["slug"] = slug

    assembled["quality_score"] = quality_score
    return assembled


# ══════════════════════════════════════════════════════════════
# 메인
# ══════════════════════════════════════════════════════════════

def main() -> None:
    global _PIPELINE_MODE

    parser = argparse.ArgumentParser(description="ThiveLab Auto Blog Generator")
    parser.add_argument("--count",         type=int, default=1)
    parser.add_argument("--dry-run",       action="store_true")
    parser.add_argument("--pipeline-mode", action="store_true",
                        help="구조화된 마커 출력 (blog_queue 워커 전용)")
    parser.add_argument("--stage",         type=str, default=None,
                        choices=["topic", "outline", "write", "quality", "seo"])
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
    _emit(f"[PIPELINE:model={model}]")

    for i in range(args.count):
        if i > 0:
            time.sleep(5)
        topic = pick_topic()
        log.info("\n[%d/%d] 토픽: %s (%s)", i + 1, args.count, topic["title"], topic["category"])
        _emit(f"[PIPELINE:topic_title={topic['title']}]")
        run_pipeline(topic, model, dry_run=args.dry_run, resume_stage=args.stage)


if __name__ == "__main__":
    main()
