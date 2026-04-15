"use client";

import { useState } from "react";
import { Clock, Play, Pause, Settings, Terminal, CheckCircle, AlertTriangle } from "lucide-react";

type CronJob = {
  id: string;
  name: string;
  script: string;
  schedule: string;
  description: string;
  enabled: boolean;
  lastRun: string | null;
  lastStatus: "success" | "failed" | "never";
};

const DEFAULT_JOBS: CronJob[] = [
  {
    id: "blog-generator",
    name: "추천 가이드 생성",
    script: "python3 scripts/blog_generator.py --count 1",
    schedule: "0 9 * * *",
    description: "매일 오전 9시 — 쿠팡 상품 기반 추천 가이드 자동 생성",
    enabled: false,
    lastRun: null,
    lastStatus: "never",
  },
  {
    id: "blog-batch",
    name: "추천 가이드 배치 (3개)",
    script: "python3 scripts/blog_generator.py --count 3",
    schedule: "0 6 * * 1",
    description: "매주 월요일 오전 6시 — 3개 카테고리 가이드 일괄 생성",
    enabled: false,
    lastRun: null,
    lastStatus: "never",
  },
];

const SCHEDULE_PRESETS = [
  { label: "매시간", value: "0 * * * *" },
  { label: "매일 6시", value: "0 6 * * *" },
  { label: "매일 9시", value: "0 9 * * *" },
  { label: "매일 18시", value: "0 18 * * *" },
  { label: "매주 월 9시", value: "0 9 * * 1" },
  { label: "매주 수/금 9시", value: "0 9 * * 3,5" },
];

export default function CronTab() {
  const [jobs, setJobs] = useState<CronJob[]>(DEFAULT_JOBS);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ name: "", script: "", schedule: "0 9 * * *", description: "" });

  const toggleJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
    );
  };

  const updateSchedule = (id: string, schedule: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, schedule } : j))
    );
    setEditingJob(null);
  };

  const addJob = () => {
    if (!newJob.name || !newJob.script) return;
    setJobs((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newJob.name,
        script: newJob.script,
        schedule: newJob.schedule,
        description: newJob.description,
        enabled: false,
        lastRun: null,
        lastStatus: "never",
      },
    ]);
    setNewJob({ name: "", script: "", schedule: "0 9 * * *", description: "" });
    setShowAddForm(false);
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const exportCrontab = () => {
    const lines = jobs
      .filter((j) => j.enabled)
      .map((j) => `${j.schedule} cd /path/to/thive-lab && ${j.script} >> logs/${j.id}.log 2>&1`);

    if (lines.length === 0) {
      alert("활성화된 크론 작업이 없습니다.");
      return;
    }

    const content = `# ThiveLab Cron Jobs — Generated ${new Date().toISOString()}\n# crontab -e 로 아래 내용을 붙여넣으세요\n\n${lines.join("\n")}\n`;
    navigator.clipboard.writeText(content);
    alert("크론탭 설정이 클립보드에 복사되었습니다.\ncrontab -e 명령어로 붙여넣으세요.");
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">크론 작업 관리</h3>
          <p className="text-xs text-zinc-500">자동화 스크립트의 실행 스케줄을 설정합니다.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-amber-500/40"
          >
            <Settings className="h-3.5 w-3.5" />
            작업 추가
          </button>
          <button
            onClick={exportCrontab}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
          >
            <Terminal className="h-3.5 w-3.5" />
            크론탭 복사
          </button>
        </div>
      </div>

      {/* 새 작업 추가 폼 */}
      {showAddForm && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <h4 className="text-sm font-semibold text-amber-300">새 크론 작업</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="작업명 (예: 주간 리포트)"
              value={newJob.name}
              onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
            <input
              placeholder="실행 명령어 (예: python3 scripts/my_script.py)"
              value={newJob.script}
              onChange={(e) => setNewJob({ ...newJob, script: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
            <select
              value={newJob.schedule}
              onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/50 focus:outline-none"
            >
              {SCHEDULE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
              ))}
            </select>
            <input
              placeholder="설명 (선택)"
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addJob} className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400">추가</button>
            <button onClick={() => setShowAddForm(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200">취소</button>
          </div>
        </div>
      )}

      {/* 작업 목록 */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`rounded-2xl border p-5 transition ${
              job.enabled
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-zinc-800 bg-zinc-900/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleJob(job.id)}
                    className={`rounded-full p-1.5 transition ${
                      job.enabled
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-800 text-zinc-600"
                    }`}
                    title={job.enabled ? "비활성화" : "활성화"}
                  >
                    {job.enabled ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">{job.name}</h4>
                    <p className="text-xs text-zinc-500">{job.description}</p>
                  </div>
                </div>

                {/* 스케줄 */}
                <div className="flex items-center gap-3 pl-10">
                  <Clock className="h-3.5 w-3.5 text-zinc-600" />
                  {editingJob === job.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newSchedule || job.schedule}
                        onChange={(e) => setNewSchedule(e.target.value)}
                        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                      >
                        {SCHEDULE_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => updateSchedule(job.id, newSchedule || job.schedule)}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingJob(null)}
                        className="text-xs text-zinc-600 hover:text-zinc-400"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingJob(job.id); setNewSchedule(job.schedule); }}
                      className="group flex items-center gap-2"
                    >
                      <code className="text-xs text-zinc-400 group-hover:text-amber-400 transition">{job.schedule}</code>
                      <span className="text-[10px] text-zinc-700 group-hover:text-zinc-400 transition">수정</span>
                    </button>
                  )}
                </div>

                {/* 명령어 */}
                <div className="pl-10">
                  <code className="text-[11px] text-zinc-600">{job.script}</code>
                </div>

                {/* 마지막 실행 */}
                <div className="flex items-center gap-2 pl-10">
                  {job.lastStatus === "success" && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                  {job.lastStatus === "failed" && <AlertTriangle className="h-3 w-3 text-red-400" />}
                  <span className="text-[10px] text-zinc-600">
                    {job.lastRun ? `마지막 실행: ${job.lastRun}` : "아직 실행 기록 없음"}
                  </span>
                </div>
              </div>

              {/* 삭제 */}
              {job.id.startsWith("custom-") && (
                <button
                  onClick={() => removeJob(job.id)}
                  className="text-xs text-zinc-700 hover:text-red-400 transition"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 안내 */}
      <div className="rounded-2xl border border-zinc-800/40 bg-zinc-900/20 p-4">
        <p className="text-xs text-zinc-600 leading-relaxed">
          <strong className="text-zinc-500">사용 방법:</strong> 원하는 작업을 활성화(▶)하고 스케줄을 설정한 뒤
          &ldquo;크론탭 복사&rdquo; 버튼을 눌러 터미널에서 <code className="text-amber-400/60">crontab -e</code>로 붙여넣으세요.
          GitHub Actions나 Vercel Cron으로도 동일한 스케줄을 적용할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
