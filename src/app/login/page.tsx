"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, LockKeyhole, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authService } from "@/services/auth";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
            const result = (await authService.login({
                email: form.get("email"),
                password: form.get("password"),
                role: "ADMIN"
            })) as {
                accessToken?: string;
                refreshToken?: string;
                data?: { accessToken?: string; refreshToken?: string };
            };
            const body: any = result.data ?? result;

            if (!body.accessToken) {
                throw new Error("Thông tin đăng nhập không hợp lệ");
            }

            if (body.role == "USER") {
                throw new Error("Tài khoản này không được quyền truy cập vào hệ thống");
            }

            localStorage.setItem("accessToken", body.accessToken);
            if (body.refreshToken) {
                localStorage.setItem("refreshToken", body.refreshToken);
            }

            localStorage.setItem(
                "tokenExpiry",
                String(Date.now() + 30 * 60 * 1000),
            );
            router.push("/admin");
        } catch (loginError: any) {
            setError(
                loginError ? loginError.message : "Đăng nhập thất bại. Vui lòng thử lại.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="glass-page flex min-h-screen items-center justify-center p-5">
            <div className="absolute right-5 top-5">
                <ThemeToggle />
            </div>
            <div className="glass-panel grid w-full max-w-5xl overflow-hidden rounded-3xl lg:grid-cols-2">
                <div className="hidden bg-indigo-600 p-12 text-white lg:block">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center rounded-xl ">
                            <img src="./logo-bible.png" alt="Lắng Nghe Kinh Thánh" width={200} height={200} />
                        </span>
                        <strong>Lắng Nghe Kinh Thánh</strong>
                    </div>
                    <div className="mt-28">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                            Trang quản trị
                        </p>
                        <h1 className="text-4xl font-bold leading-tight">
                            Quản trị nội dung
                            <br />
                            đơn giản hơn.
                        </h1>
                        <p className="mt-5 max-w-sm text-indigo-100">
                            Một nơi để quản lý người dùng, nội dung Kinh Thánh
                            và quyền truy cập an toàn.
                        </p>
                    </div>
                </div>
                <div className="p-7 sm:p-12">
                    <div className="mx-auto max-w-sm">
                        <div className="mb-10 lg:hidden">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
                                    <img src="./logo-bible.png" alt="Lắng Nghe Kinh Thánh" width={200} height={200} />
                                </span>
                                <strong>Lắng Nghe Kinh Thánh</strong>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-indigo-600">
                            Chào mừng trở lại
                        </p>
                        <h2 className="mt-2 text-3xl text-slate-500 font-bold">Đăng nhập</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Đăng nhập để tiếp tục vào trang quản trị.
                        </p>
                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <label className="block text-sm font-semibold text-slate-500">
                                Email
                                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/30 px-4 py-3 dark:border-slate-700">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    <input
                                        name="email"
                                        required
                                        type="email"
                                        placeholder="admin@audiobible.vn"
                                        className="w-full bg-transparent text-sm outline-none text-slate-500"
                                    />
                                </div>
                            </label>
                            <label className="block text-sm font-semibold text-slate-500">
                                Mật khẩu
                                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/30 px-4 py-3 dark:border-slate-700">
                                    <LockKeyhole className="h-4 w-4 text-slate-500" />
                                    <input
                                        name="password"
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            </label>
                            {error && (
                                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                                    {error}
                                </p>
                            )}
                            <div className="flex justify-end">
                                <a
                                    href="#forgot"
                                    className="text-xs font-semibold text-indigo-600"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <button
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {loading ? "Đang xác thực..." : "Đăng nhập"}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
