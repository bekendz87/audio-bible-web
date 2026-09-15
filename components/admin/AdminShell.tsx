"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { userService } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { FlashAlert } from "@/components/admin/feedback";
import { ConfirmModal } from "@/components/admin/crud";
import { getRoleLabel } from "@/lib/role-helper";

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

interface UserProfile {
  id?: string | number;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { canAccess } = useAutoPermissions();
  const { logout } = useAuth();
  const [notice, setNotice] = useState("");
  const [tone, setTone] = useState<"success" | "error" | "warning">("success");
  const [confirmLogout, setConfirmLogout] = useState<any | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res: any = await userService.info();
        const data = res?.data || res;
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng ở AdminShell:", error);
      }
    }

    fetchUserInfo();
  }, []);

  async function handleLogout() {
    const refreshToken = Cookies.get("refreshToken");

    if (refreshToken) {
      try {
        const logOutRes: any = await authService.logout(refreshToken);

        if (logOutRes && (logOutRes.status === 200 || logOutRes.data?.success)) {
          logout();
          setNotice("Đăng xuất thành công!");
          setTone("success");
        } else {
          logout();
        }
      } catch (ex: any) {
        logout();
        console.error(ex);
      }
    } else {
      logout();
    }
  }

  const openModalLogout = () => {
    if (!confirmLogout) {
      return;
    }
    handleLogout();
    setConfirmLogout(null);
  };

  const displayName = profile?.fullName || profile?.name || "Admin User";
  const displayEmail = profile?.email || "admin@audiobible.vn";
  const avatarInitials = displayName
    .split(" ")
    .map((word) => word[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="glass-page min-h-screen text-slate-900 dark:text-slate-100">
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r px-5 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="grid place-items-center rounded-2xl dark:shadow-none">
              <img
                src="/images/logo-bible.png"
                alt="Lắng Nghe Kinh Thánh"
                width={200}
                height={200}
              />
            </span>
            <span>
              <strong className="block text-sm">Lắng Nghe Kinh Thánh</strong>
              <small className="text-xs text-slate-400">Trang quản trị</small>
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

        <nav className="mt-10 space-y-1" aria-label="Điều hướng quản trị">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Danh mục
          </p>
          {navigation
            .filter(
              (item) =>
                item.href === "/admin" ||
                canAccess("GET", item.href.replace("/admin", ""))
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
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 ${active
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-600"
                      }`}
                  />
                  {item.label}
                  {active && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
        </nav>

        <div className="glass-panel mt-auto rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-slate-400">
                {getRoleLabel(profile?.role) || "Quản trị viên"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmLogout({ name: "Đăng xuất" })}
            className="flex items-center gap-2 text-xs font-semibold text-rose-500 hover:text-rose-600"
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
              Lắng Nghe Kinh Thánh
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <strong className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                {displayName}
              </strong>
              <small className="text-xs text-slate-400">{displayEmail}</small>
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="admin-content mx-auto max-w-375 p-5 sm:p-8">
          {children}
        </main>
      </div>

      {notice && (
        <FlashAlert
          message={notice}
          onClose={() => setNotice("")}
          tone={tone}
        />
      )}

      <ConfirmModal
        title="Đăng xuất"
        open={Boolean(confirmLogout)}
        itemName={confirmLogout?.name}
        onClose={() => setConfirmLogout(null)}
        onConfirm={openModalLogout}
      />
    </div>
  );
}