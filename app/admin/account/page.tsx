"use client";

import { useEffect, useState } from "react";
import { Bell, Lock, Mail, Save, UserRound, Loader2 } from "lucide-react";
import { Button, Input, PageHeader } from "@/components/admin/ui";
import { FlashAlert } from "@/components/admin/feedback";
import { userService } from "@/services/user";
import { getRoleLabel, getRoleTone } from "@/lib/role-helper";
import { Badge } from "@/components/admin/ui"
interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
}

export default function AccountPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [tone, setTone] = useState<any>("success");

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                setLoading(true);
                const res: any = await userService.info();
                const data = res?.data || res;

                if (data) {
                    setUser(data);
                    setName(data.fullName || "");
                    setEmail(data.email || "");
                }
            } catch (error: any) {
                console.error("Lỗi lấy thông tin tài khoản:", error);
                setNotice(error?.message || "Không thể tải thông tin tài khoản");
                setTone("error");
            } finally {
                setLoading(false);
            }
        }

        fetchUserInfo();
    }, []);

    async function handleUpdateProfile(event: React.FormEvent) {
        event.preventDefault();
        try {
            setSaving(true);
            const updateProfile: any = await userService.update(Number(user?.id), { fullName: name });

            if (updateProfile && updateProfile.status != 200) {
                setNotice(`${updateProfile && updateProfile.message ? updateProfile.message : "Cập nhật thông tin thất bại!"}`);
                setTone("error");
            }

            setNotice("Cập nhật thông tin tài khoản thành công!");
            setTone("success");
        } catch (error: any) {
            setNotice(error?.message || "Cập nhật thông tin thất bại!");
            setTone("error");
        } finally {
            setSaving(false);
        }
    }


    async function handleChangePassword(event: React.FormEvent) {
        event.preventDefault();
        if (!oldPassword) {
            setNotice("Vui lòng nhập mật khẩu hiện tại");
            setTone("error");
            return;
        }

        if (oldPassword.length < 6) {
            setNotice("Mật khẩu hiện tại phải có ít nhất 6 ký tự");
            setTone("error");
            return;
        }

        if (!newPassword) {
            setNotice("Vui lòng nhập mật khẩu mới");
            setTone("error");
            return;
        }

        if (newPassword.length < 6) {
            setNotice("Mật khẩu mới phải có ít nhất 6 ký tự");
            setTone("error");
            return;
        }

        try {
            setSaving(true);

            const updateUser: any = await userService.update(Number(user?.id), { "newPassword": newPassword, "oldPassword": oldPassword });
            if (updateUser && updateUser.status != 200) {
                setNotice(`${updateUser && updateUser.message ? updateUser.message : "Đổi mật khẩu thất bại!"}`);
                setTone("error");
            }
            setOldPassword("");
            setNewPassword("");
            setNotice("Đổi mật khẩu thành công!");
            setTone("success");

        } catch (error: any) {
            setNotice(error?.message || "Đổi mật khẩu thất bại!");
            setTone("error");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-slate-500">Đang tải thông tin tài khoản...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="Thông tin tài khoản"
                description="Cập nhật thông tin cá nhân và thiết lập bảo mật"
            />
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
                <section className="glass-panel rounded-2xl p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="grid h-24 w-24 place-items-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                            <UserRound className="h-9 w-9" />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
                            {name || "N/A"}
                        </h2>
                        <Badge tone={getRoleTone(user?.role)}>
                            {getRoleLabel(user?.role)}
                        </Badge>
                        <Button variant="secondary" className="mt-5">
                            Đổi ảnh đại diện
                        </Button>
                    </div>
                    <div className="mt-8 space-y-4 border-t border-slate-200/60 pt-6 text-sm dark:border-slate-700/60">
                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                            <Mail className="h-4 w-4 text-indigo-500" />
                            {email || "Chưa có email"}
                        </p>
                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                            <Bell className="h-4 w-4 text-indigo-500" />
                            Nhận thông báo hệ thống
                        </p>
                    </div>
                </section>

                <section className="glass-panel rounded-2xl p-6">
                    <form onSubmit={handleUpdateProfile}>
                        <h2 className="font-bold text-slate-800 dark:text-slate-100">
                            Thông tin cá nhân
                        </h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <Input
                                label="Họ và tên"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input label="Email" value={email} readOnly disabled />

                        </div>
                        <Button type="submit" className="mt-6" disabled={saving}>
                            <Save className="h-4 w-4" />
                            Lưu thay đổi
                        </Button>
                    </form>

                    <form
                        onSubmit={handleChangePassword}
                        className="mt-10 border-t border-slate-200/60 pt-6 dark:border-slate-700/60"
                    >
                        <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                            <Lock className="h-4 w-4 text-indigo-500" />
                            Đổi mật khẩu
                        </h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Input
                                label="Mật khẩu hiện tại"
                                type="password"
                                placeholder="••••••••"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <Input
                                label="Mật khẩu mới"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="mt-5" disabled={saving}>
                            Cập nhật mật khẩu
                        </Button>
                    </form>
                </section>
            </div>

            {notice && (
                <FlashAlert
                    message={notice}
                    tone={tone}
                    onClose={() => setNotice("")}
                />
            )}
        </>
    );
}