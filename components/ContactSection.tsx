"use client";

import { useState } from "react";
import { Send, CheckCircle2, MessageSquare } from "lucide-react";

const TYPES = ["상품 추천 요청", "제휴/협업", "버그 신고", "기타"] as const;

export default function ContactSection() {
  const [form, setForm]     = useState({ name: "", email: "", type: "기타", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch("/api/contact", {
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
    <section className="border-t border-gray-100 bg-gray-50 px-4 py-14 lg:px-8">
      <div className="mx-auto max-w-xl">

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gray-400">
            <MessageSquare className="h-3.5 w-3.5" />
            Contact
          </div>
          <h2 className="text-2xl font-bold text-gray-900">문의하기</h2>
          <p className="mt-2 text-sm text-gray-500">
            상품 추천 요청, 제휴·협업, 또는 기타 문의사항을 남겨주세요.
          </p>
        </div>

        {/* 성공 상태 */}
        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-8 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">문의가 접수되었습니다!</p>
              <p className="mt-1 text-sm text-gray-500">빠른 시일 내에 답변 드리겠습니다.</p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="mt-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              새 문의 작성
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-5">

              {/* 이름 + 이메일 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    이름 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="홍길동"
                    value={form.name}
                    onChange={set("name")}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    이메일 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={100}
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={set("email")}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>

              {/* 문의 유형 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  문의 유형
                </label>
                <select
                  value={form.type}
                  onChange={set("type")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* 내용 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  문의 내용 <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  placeholder="문의하실 내용을 자세히 적어주세요. (10자 이상)"
                  value={form.message}
                  onChange={set("message")}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
                <p className="mt-1 text-right text-xs text-gray-300">{form.message.length} / 2000</p>
              </div>

              {/* 에러 메시지 */}
              {status === "error" && errMsg && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {errMsg}
                </p>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black shadow-md shadow-amber-200/60 transition hover:bg-amber-400 active:scale-95 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {status === "loading" ? "전송 중..." : "문의 보내기"}
              </button>

            </div>
          </form>
        )}

      </div>
    </section>
  );
}
