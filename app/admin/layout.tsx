import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Thive Lab",
  description: "Thive Lab 프로젝트 관리 페이지",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
