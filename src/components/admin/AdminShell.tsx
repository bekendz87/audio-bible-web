"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FolderTree,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAutoPermissions } from "@/components/PermissionProvider";
import { authService } from "@/services/auth";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/permissions", label: "Phân quyền", icon: ShieldCheck },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/books", label: "Quản lý sách", icon: BookOpen },
  { href: "/admin/chapters", label: "Quản lý chương", icon: BookOpen },
  { href: "/admin/audio-upload", label: "Upload audio", icon: Headphones },
  { href: "/admin/account", label: "Tài khoản của tôi", icon: UserCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { canAccess } = useAutoPermissions();

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    if (refreshToken)
      await authService.logout(refreshToken).catch(() => undefined);
    router.push("/login");
  }

  return (
    <div className="glass-page min-h-screen text-slate-900 dark:text-slate-100">
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r px-5 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>
              <strong className="block text-sm">
                Audio Bible
              </strong>
              <small className="text-xs text-slate-400">
                Admin Console
              </small>
            </span>
          </Link>
          <button
            className="rounded-lg p-2 text-slate-400 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="mt-10 space-y-1"
          aria-label="Điều hướng quản trị"
        >
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          {navigation
            .filter(
              (item) =>
                item.href === "/admin" ||
                canAccess(
                  "GET",
                  item.href.replace("/admin", ""),
                ),
            )
            .map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                  {item.label}
                  {active && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              );
            })}
        </nav>

        <div className="glass-panel mt-auto rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              AD
            </div>
            <div>
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-slate-400">
                Quản trị viên
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-500"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}

      <div className="lg:pl-72">
        <header className="glass-header sticky top-0 z-20 flex h-19 items-center justify-between border-b px-5 sm:px-8">
          <button
            className="rounded-xl p-2 text-slate-500 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden text-sm text-slate-400 sm:block">
            Hệ thống quản trị /{" "}
            <span className="text-slate-700 dark:text-slate-200">
              Audio Bible
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <strong className="block text-sm">
                Nguyễn Văn Admin
              </strong>
              <small className="text-xs text-slate-400">
                admin@audiobible.vn
              </small>
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="admin-content mx-auto max-w-375 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
