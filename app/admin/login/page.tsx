"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 토큰을 세션 스토리지에 저장
        sessionStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-white">Admin Login</h1>
          <p className="mt-2 text-zinc-400">Thive Lab 관리자 페이지</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                아이디
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-indigo-300 transition"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-600">
          <p>보안을 위해 로그인 정보를 안전하게 보관하세요.</p>
        </div>
      </div>
    </div>
  );
}
