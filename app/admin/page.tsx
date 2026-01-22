"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Radar,
  BriefcaseBusiness,
  Bot,
  WalletMinimal,
  Database,
  Cpu,
  LogOut,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const ICON_OPTIONS = {
  Radar: <Radar className="h-5 w-5" />,
  BriefcaseBusiness: <BriefcaseBusiness className="h-5 w-5" />,
  Bot: <Bot className="h-5 w-5" />,
  WalletMinimal: <WalletMinimal className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
};

type DBProject = {
  id: number;
  name: string;
  status: "Live" | "Beta" | "Coming Soon";
  description: string;
  link: string;
  icon_name: string;
  layout: string;
};

type FormData = {
  id?: number;
  name: string;
  status: "Live" | "Beta" | "Coming Soon";
  description: string;
  link: string;
  iconName: keyof typeof ICON_OPTIONS;
  layout: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  status: "Coming Soon",
  description: "",
  link: "#",
  iconName: "Radar",
  layout: "sm:col-span-3",
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      loadProjects();
    }
  }, [router]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects");
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      alert("프로젝트 로드 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const handleOpenForm = (project?: DBProject) => {
    if (project) {
      setFormData({
        id: project.id,
        name: project.name,
        status: project.status,
        description: project.description,
        link: project.link,
        iconName: (project.icon_name as keyof typeof ICON_OPTIONS) || "Radar",
        layout: project.layout,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = sessionStorage.getItem("admin_token");
      const body = {
        id: formData.id,
        name: formData.name,
        status: formData.status,
        description: formData.description,
        link: formData.link,
        icon_name: formData.iconName,
        layout: formData.layout,
      };

      const url = "/api/projects";
      const method = formData.id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        await loadProjects();
        handleCloseForm();
      } else {
        alert(result.message || "저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 프로젝트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("admin_token");
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        await loadProjects();
      } else {
        alert(result.message || "삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-indigo-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              메인으로 돌아가기
            </Link>
            <h1 className="text-4xl font-semibold text-white">프로젝트 관리</h1>
            <p className="text-zinc-400">Supabase DB를 통한 프로젝트 관리</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadProjects}
              className="flex items-center gap-2 rounded-2xl border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-indigo-500/50"
              title="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 rounded-2xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" />
              새 프로젝트
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-red-500/50 hover:text-red-400"
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* Projects Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-400">데이터를 불러오는 중...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <p className="text-zinc-400">등록된 프로젝트가 없습니다.</p>
            <button
              onClick={() => handleOpenForm()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" />
              첫 프로젝트 추가하기
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full">
              <thead className="border-b border-zinc-800 bg-zinc-950/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    아이콘
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    프로젝트명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    설명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    링크
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    레이아웃
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {projects.map((project) => (
                  <tr key={project.id} className="transition hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-500">#{project.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                        {ICON_OPTIONS[project.icon_name as keyof typeof ICON_OPTIONS] || ICON_OPTIONS.Radar}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          project.status === "Live"
                            ? "bg-emerald-500/10 text-emerald-200"
                            : project.status === "Beta"
                            ? "bg-amber-500/10 text-amber-200"
                            : "bg-zinc-800/80 text-zinc-300"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md text-sm text-zinc-400 line-clamp-2">
                        {project.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.link !== "#" ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200"
                        >
                          <ExternalLink className="h-3 w-3" />
                          링크
                        </a>
                      ) : (
                        <span className="text-sm text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-zinc-500">{project.layout || "-"}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenForm(project)}
                          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-indigo-300"
                          title="수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
              <div className="border-b border-zinc-800 px-8 py-6">
                <h2 className="text-2xl font-semibold text-white">
                  {formData.id ? "프로젝트 수정" : "새 프로젝트 추가"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      프로젝트명 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="예: Steam Scout"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      상태 *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as FormData["status"],
                        })
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Live">Live</option>
                      <option value="Beta">Beta</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      설명 *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      링크
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="https://example.com (비활성화는 #)"
                    />
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      아이콘 *
                    </label>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {Object.entries(ICON_OPTIONS).map(([name, icon]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, iconName: name as keyof typeof ICON_OPTIONS })
                          }
                          className={`flex h-16 items-center justify-center rounded-xl border transition ${
                            formData.iconName === name
                              ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                              : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layout */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      레이아웃 크기 *
                    </label>
                    <select
                      required
                      value={formData.layout}
                      onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="sm:col-span-2">작은 카드 (2칸)</option>
                      <option value="sm:col-span-3">중간 카드 (3칸)</option>
                      <option value="sm:col-span-4">큰 카드 (4칸)</option>
                      <option value="sm:col-span-6">전체 너비 (6칸)</option>
                      <option value="sm:col-span-3 sm:row-span-2">세로 긴 카드 (3칸 x 2칸)</option>
                    </select>
                    <p className="mt-1 text-xs text-zinc-500">
                      그리드에서 카드가 차지할 크기를 선택하세요
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={isSaving}
                    className="flex-1 rounded-xl border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                  >
                    {isSaving ? "저장 중..." : formData.id ? "수정" : "추가"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
