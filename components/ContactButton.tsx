"use client";

import { useState, useEffect, useRef } from "react";
import { Send, CheckCircle2, MessageSquare, X } from "lucide-react";

const TYPES = ["상품 추천 요청", "제휴/협업", "버그 신고", "기타"] as const;

export default function ContactButton() {
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState({ name: "", email: "", type: "기타", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const backdropRef         = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 모달 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleClose = () => {
    setOpen(false);
    if (status === "success") {
      setStatus("idle");
      setForm({ name: "", email: "", type: "기타", message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrMsg(data.error ?? "오류가 발생했습니다.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", type: "기타", message: "" });
    } catch {
      setErrMsg("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setStatus("error");
    }
  };

  return (
    <>
      {/* ── 플로팅 버튼 ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="문의하기"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-amber-300/50 transition hover:bg-amber-400 hover:scale-105 active:scale-95"
      >
        <MessageSquare className="h-4 w-4" />
        문의하기
      </button>

      {/* ── 모달 ─────────────────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) handleClose(); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl">

            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">문의하기</h2>
                <p className="mt-0.5 text-xs text-gray-400">상품 추천, 제휴, 기타 문의를 남겨주세요.</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 바디 */}
            <div className="px-6 py-6">
              {status === "success" ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <div>
                    <p className="text-base font-bold text-gray-900">문의가 접수되었습니다!</p>
                    <p className="mt-1 text-sm text-gray-500">빠른 시일 내에 답변 드리겠습니다.</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-1 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* 이름 + 이메일 */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        이름 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text" required maxLength={50} placeholder="홍길동"
                        value={form.name} onChange={set("name")}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        이메일 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email" required maxLength={100} placeholder="example@email.com"
                        value={form.email} onChange={set("email")}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      />
                    </div>
                  </div>

                  {/* 문의 유형 */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">문의 유형</label>
                    <select
                      value={form.type} onChange={set("type")}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    >
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* 내용 */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      문의 내용 <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required minLength={10} maxLength={2000} rows={4}
                      placeholder="문의하실 내용을 자세히 적어주세요. (10자 이상)"
                      value={form.message} onChange={set("message")}
                      className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                    <p className="mt-1 text-right text-xs text-gray-300">{form.message.length} / 2000</p>
                  </div>

                  {/* 에러 */}
                  {status === "error" && errMsg && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">{errMsg}</p>
                  )}

                  {/* 제출 */}
                  <button
                    type="submit" disabled={status === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-black shadow-md shadow-amber-200/60 transition hover:bg-amber-400 active:scale-95 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {status === "loading" ? "전송 중..." : "문의 보내기"}
                  </button>

                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
