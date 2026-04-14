#!/usr/bin/env python3
"""
ThiveLab Auto Blog Generator

OpenAI gpt-4o-mini로 한국어 테크 포스트를 생성하고 Supabase에 저장합니다.
반복 방지: .blog_history.json으로 최근 토픽 추적.

Usage:
    python blog_generator.py              # 1개 생성
    python blog_generator.py --count 3    # 3개 생성
    python blog_generator.py --dry-run    # 저장 없이 출력만
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

OPENAI_API_KEY  = os.getenv("OPENAI_API_KEY", "")
SUPABASE_URL    = (os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
SUPABASE_KEY    = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
OPENAI_MODEL    = os.getenv("BLOG_OPENAI_MODEL", "gpt-4o-mini")

# ── 로깅 ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── 유효성 검사 ───────────────────────────────────────────────
def _validate_env() -> None:
    missing = []
    if not OPENAI_API_KEY:
        missing.append("OPENAI_API_KEY")
    if not SUPABASE_URL:
        missing.append("NEXT_PUBLIC_SUPABASE_URL")
    if not SUPABASE_KEY:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        log.error("필수 환경변수 누락: %s", ", ".join(missing))
        log.error(".env.local에 해당 값을 설정해 주세요.")
        sys.exit(1)

# ── 토픽 목록 ─────────────────────────────────────────────────
TOPICS = [
    # AI / LLM
    {"key": "llm_prompt_engineering",  "title": "LLM 프롬프트 엔지니어링 실전 가이드",            "category": "AI"},
    {"key": "ai_agent_tools",          "title": "2025년 AI 에이전트 도구 비교: LangChain vs CrewAI", "category": "AI"},
    {"key": "rag_pipeline",            "title": "RAG 파이프라인 구축 완전 정복",                   "category": "AI"},
    {"key": "llm_finetuning_intro",    "title": "비용 없이 LLM 파인튜닝하는 법 (LoRA 활용)",      "category": "AI"},
    {"key": "local_llm_ollama",        "title": "Ollama로 로컬 LLM 서버 세팅하기",                "category": "AI"},
    # 인디해커 / 마이크로 SaaS
    {"key": "indie_mrr_100",           "title": "MRR $100 달성하는 마이크로 SaaS 전략",           "category": "Indie"},
    {"key": "supabase_mvp",            "title": "Supabase로 MVP 24시간 안에 만들기",               "category": "Indie"},
    {"key": "nextjs_saas_boilerplate", "title": "Next.js SaaS 보일러플레이트 완전 해부",           "category": "Dev"},
    {"key": "stripe_subscription",     "title": "Stripe 구독 결제 연동 실전 노트",                 "category": "Dev"},
    {"key": "vercel_edge_functions",   "title": "Vercel Edge Functions 활용 패턴 모음",            "category": "Dev"},
    # 자동화
    {"key": "python_automation_2025",  "title": "파이썬으로 반복 업무 자동화하는 7가지 방법",      "category": "Automation"},
    {"key": "github_actions_ci",       "title": "GitHub Actions로 CI/CD 파이프라인 5분 설정",      "category": "DevOps"},
    {"key": "cron_job_patterns",       "title": "서버리스 크론 잡 설계 패턴 (Vercel Cron 포함)",   "category": "DevOps"},
    {"key": "playwright_scraping",     "title": "Playwright 기반 스크레이핑 완전 가이드",           "category": "Automation"},
    # 개발자 성장
    {"key": "open_source_contrib",     "title": "오픈소스 기여로 포트폴리오 만드는 법",            "category": "Growth"},
    {"key": "side_project_launch",     "title": "사이드 프로젝트 론칭 체크리스트 25가지",          "category": "Growth"},
    {"key": "dev_twitter_growth",      "title": "개발자 트위터(X) 팔로워 늘리는 실전 방법",       "category": "Growth"},
    {"key": "technical_writing",       "title": "기술 블로그 잘 쓰는 개발자들의 공통점",           "category": "Growth"},
    # 보안
    {"key": "supabase_rls",            "title": "Supabase RLS 정책 완전 정복",                     "category": "Security"},
    {"key": "api_security_basics",     "title": "REST API 보안 기초: 개발자가 꼭 알아야 할 것들",  "category": "Security"},
    {"key": "jwt_auth_patterns",       "title": "JWT 인증 구현 패턴과 흔한 실수",                  "category": "Security"},
    # 데이터 / ETL
    {"key": "supabase_realtime",       "title": "Supabase Realtime으로 실시간 대시보드 만들기",    "category": "Data"},
    {"key": "steam_data_api",          "title": "Steam Web API 데이터 수집과 분석",                "category": "Data"},
    {"key": "etl_python_patterns",     "title": "파이썬 ETL 파이프라인 설계 패턴",                 "category": "Data"},
]

# ── 히스토리 ──────────────────────────────────────────────────
HISTORY_FILE = Path(__file__).parent / ".blog_history.json"
HISTORY_KEEP = 10

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
        HISTORY_FILE.write_text(
            json.dumps(history[:HISTORY_KEEP], ensure_ascii=False),
            "utf-8",
        )
    except Exception:
        pass

def pick_topic() -> dict:
    recent = set(_load_history())
    pool = [t for t in TOPICS if t["key"] not in recent]
    if not pool:
        pool = TOPICS
    return random.choice(pool)

# ── Slugify ───────────────────────────────────────────────────
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

# ── Markdown → HTML (의존성 없이 최소 변환) ───────────────────
def md_to_html(md: str) -> str:
    """간단한 마크다운 → HTML 변환 (외부 패키지 없음)"""
    html = md

    # 코드 블록
    html = re.sub(
        r"```(\w*)\n([\s\S]*?)```",
        lambda m: f'<pre><code class="language-{m.group(1)}">{m.group(2).rstrip()}</code></pre>',
        html,
    )
    # 인라인 코드
    html = re.sub(r"`([^`]+)`", r"<code>\1</code>", html)

    # 헤딩
    for n in range(4, 0, -1):
        pattern = r"^" + "#" * n + r" (.+)$"
        html = re.sub(pattern, rf"<h{n}>\1</h{n}>", html, flags=re.MULTILINE)

    # 볼드 / 이탤릭
    html = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html)
    html = re.sub(r"\*(.+?)\*",     r"<em>\1</em>",         html)

    # 순서 없는 리스트
    html = re.sub(r"^[-*] (.+)$", r"<li>\1</li>", html, flags=re.MULTILINE)
    html = re.sub(r"(<li>.*</li>)", r"<ul>\1</ul>", html, flags=re.DOTALL)

    # 수평선
    html = re.sub(r"^---+$", "<hr>", html, flags=re.MULTILINE)

    # 빈 줄 → 단락 구분
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

# ── OpenAI 호출 ───────────────────────────────────────────────
def generate_post(topic: dict) -> dict:
    system_prompt = (
        "당신은 한국의 인디 해커이자 풀스택 개발자입니다. "
        "실용적인 한국어 기술 블로그 포스트를 마크다운으로 작성합니다. "
        "서론 없이 바로 본론부터 시작하고, 실제 코드 예시나 구체적인 수치를 포함하세요. "
        "길이는 600~900 단어입니다."
    )
    user_prompt = (
        f"주제: {topic['title']}\n\n"
        "다음 형식으로 작성해 주세요:\n"
        "1. 핵심 요약 1~2문장 (첫 문단)\n"
        "2. ## 소제목 3~4개로 구성된 본문\n"
        "3. 실제 코드 예시 (코드 블록 포함)\n"
        "4. ## 마무리: 핵심 정리 3가지 bullet\n\n"
        "태그 5개를 마지막 줄에 쉼표로 구분해서 추가하세요: (예: tags: Python, API, Supabase, 자동화, SaaS)"
    )

    log.info("[OpenAI] 포스트 생성 중: %s", topic["title"])
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            "temperature": 0.75,
            "max_tokens": 2000,
        },
        timeout=60,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"].strip()

    # 태그 파싱
    tags: list[str] = []
    tag_match = re.search(r"tags?:\s*(.+)$", content, re.IGNORECASE | re.MULTILINE)
    if tag_match:
        tags = [t.strip() for t in tag_match.group(1).split(",") if t.strip()]
        content = content[: tag_match.start()].rstrip()

    # 요약 (첫 단락)
    summary_match = re.match(r"^(.+?)(?:\n|$)", content.strip())
    summary = summary_match.group(1).strip() if summary_match else topic["title"]

    return {
        "content":      content,
        "content_html": md_to_html(content),
        "tags":         tags,
        "summary":      summary[:300],
    }

# ── Supabase 저장 ─────────────────────────────────────────────
def save_post(topic: dict, generated: dict, slug: str) -> str:
    record = {
        "slug":         slug,
        "title":        topic["title"],
        "summary":      generated["summary"],
        "content":      generated["content"],
        "content_html": generated["content_html"],
        "tags":         generated["tags"],
        "category":     topic["category"],
        "status":       "published",
        "source":       "auto",
        "topic_key":    topic["key"],
        "created_at":   datetime.utcnow().isoformat(),
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
    log.info("[DB] 저장 완료: %s", slug)
    return slug

# ── 메인 ──────────────────────────────────────────────────────
def run(count: int = 1, dry_run: bool = False) -> None:
    if not dry_run:
        _validate_env()

    for i in range(count):
        if i > 0:
            time.sleep(3)

        topic = pick_topic()
        log.info("[%d/%d] 토픽: %s (%s)", i + 1, count, topic["title"], topic["category"])

        generated = generate_post(topic)
        slug = slugify(topic["title"])

        if dry_run:
            print("\n" + "=" * 60)
            print(f"Title   : {topic['title']}")
            print(f"Slug    : {slug}")
            print(f"Category: {topic['category']}")
            print(f"Tags    : {', '.join(generated['tags'])}")
            print(f"Summary : {generated['summary']}")
            print("-" * 60)
            print(generated["content"][:800], "…")
        else:
            slug = unique_slug(slug)
            save_post(topic, generated, slug)
            _save_history(topic["key"])
            log.info("[완료] /blog/%s", slug)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ThiveLab Auto Blog Generator")
    parser.add_argument("--count",   type=int, default=1,     help="생성할 포스트 수 (기본 1)")
    parser.add_argument("--dry-run", action="store_true",     help="저장 없이 내용만 출력")
    args = parser.parse_args()
    run(count=args.count, dry_run=args.dry_run)
