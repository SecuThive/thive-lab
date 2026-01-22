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
} from "lucide-react";
import Link from "next/link";
import type { Project } from "@/components/ProjectCard";

const ICON_OPTIONS = {
  Radar: <Radar className="h-5 w-5" />,
  BriefcaseBusiness: <BriefcaseBusiness className="h-5 w-5" />,
  Bot: <Bot className="h-5 w-5" />,
  WalletMinimal: <WalletMinimal className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
};

const INITIAL_PROJECTS: Project[] = [
  {
    name: "Steam Scout",
    status: "Live",
    description: "Price intelligence for Steam hardware with archived drop history.",
    link: "https://steam.thivelab.com",
    icon: ICON_OPTIONS.Radar,
    layout: "sm:col-span-3 sm:row-span-2",
  },
  {
    name: "Junior Jobs",
    status: "Beta",
    description: "Signal-based job board for emerging talent with daily scrapes and filters.",
    link: "#",
    icon: ICON_OPTIONS.BriefcaseBusiness,
    layout: "sm:col-span-3",
  },
  {
    name: "Subsidy AI",
    status: "Coming Soon",
    description: "Gov incentives radar tuned to your stack, geography, and hiring plan.",
    link: "#",
    icon: ICON_OPTIONS.Bot,
    layout: "sm:col-span-2",
  },
  {
    name: "Ledger Pulse",
    status: "Live",
    description: "Finance cockpit to monitor MRR, burn, and cash runway in a single view.",
    link: "https://finance.thivelab.com",
    icon: ICON_OPTIONS.WalletMinimal,
    layout: "sm:col-span-2",
  },
  {
    name: "Signal Vault",
    status: "Beta",
    description: "Ops telemetry overlays that merge product analytics, support, and alerting.",
    link: "https://ops.thivelab.com",
    icon: ICON_OPTIONS.Database,
    layout: "sm:col-span-4",
  },
  {
    name: "Relay Forms",
    status: "Coming Soon",
    description: "Adaptive intake forms that sync structured data into your ops stack automatically.",
    link: "#",
    icon: ICON_OPTIONS.Cpu,
    layout: "sm:col-span-2",
  },
];

type FormData = {
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
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    // 로그인 확인
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleOpenForm = (index?: number) => {
    if (index !== undefined) {
      const project = projects[index];
      const iconName = Object.keys(ICON_OPTIONS).find(
        (key) => ICON_OPTIONS[key as keyof typeof ICON_OPTIONS] === project.icon
      ) as keyof typeof ICON_OPTIONS || "Radar";
      
      setFormData({
        name: project.name,
        status: project.status,
        description: project.description,
        link: project.link,
        iconName,
        layout: project.layout || "sm:col-span-3",
      });
      setEditingIndex(index);
    } else {
      setFormData(EMPTY_FORM);
      setEditingIndex(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      ...formData,
      icon: ICON_OPTIONS[formData.iconName],
    };

    if (editingIndex !== null) {
      const updated = [...projects];
      updated[editingIndex] = newProject;
      setProjects(updated);
    } else {
      setProjects([...projects, newProject]);
    }

    handleCloseForm();
  };

  const handleDelete = (index: number) => {
    if (confirm("이 프로젝트를 삭제하시겠습니까?")) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

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
            <p className="text-zinc-400">프로젝트를 추가, 수정, 삭제할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full">
            <thead className="border-b border-zinc-800 bg-zinc-950/60">
              <tr>
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
              {projects.map((project, index) => (
                <tr key={index} className="transition hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                      {project.icon}
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
                        onClick={() => handleOpenForm(index)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-indigo-300"
                        title="수정"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
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

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
              <div className="border-b border-zinc-800 px-8 py-6">
                <h2 className="text-2xl font-semibold text-white">
                  {editingIndex !== null ? "프로젝트 수정" : "새 프로젝트 추가"}
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
                      레이아웃 클래스
                    </label>
                    <input
                      type="text"
                      value={formData.layout}
                      onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="예: sm:col-span-3"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Tailwind grid 클래스 (sm:col-span-3, sm:row-span-2 등)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 rounded-xl border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
                  >
                    {editingIndex !== null ? "수정" : "추가"}
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
