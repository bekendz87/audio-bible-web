"use client";

import { useState } from "react";
import { Bell, Lock, Mail, Save, UserRound } from "lucide-react";
import { Button, Input, PageHeader } from "@/components/admin/ui";
import { FlashAlert } from "@/components/admin/feedback";

export default function AccountPage() {
    const [name, setName] = useState("Nguyễn Văn Admin");
    const [phone, setPhone] = useState("");
    const [notice, setNotice] = useState("");
    function save(event: React.FormEvent) {
        event.preventDefault();
        setNotice(
            `Đã lưu thông tin tài khoản của ${name}. Dữ liệu hiện chỉ lưu trên giao diện.`,
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
                        <h2 className="mt-4 text-lg font-bold">{name}</h2>
                        <p className="text-sm text-slate-500">Super Admin</p>
                        <Button variant="secondary" className="mt-5">
                            Đổi ảnh đại diện
                        </Button>
                    </div>
                    <div className="mt-8 space-y-4 border-t border-slate-200/60 pt-6 text-sm dark:border-slate-700/60">
                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                            <Mail className="h-4 w-4 text-indigo-500" />
                            admin@audiobible.vn
                        </p>
                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                            <Bell className="h-4 w-4 text-indigo-500" />
                            Nhận thông báo hệ thống
                        </p>
                    </div>
                </section>
                <section className="glass-panel rounded-2xl p-6">
                    <form onSubmit={save}>
                        <h2 className="font-bold">Thông tin cá nhân</h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <Input
                                label="Họ và tên"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                            <Input
                                label="Email"
                                value="admin@audiobible.vn"
                                readOnly
                            />
                            <Input
                                label="Số điện thoại"
                                placeholder="Chưa cập nhật"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                            />
                        </div>
                        <Button type="submit" className="mt-6">
                            <Save className="h-4 w-4" />
                            Lưu thay đổi
                        </Button>
                    </form>
                    <div className="mt-10 border-t border-slate-200/60 pt-6 dark:border-slate-700/60">
                        <h2 className="flex items-center gap-2 font-bold">
                            <Lock className="h-4 w-4 text-indigo-500" />
                            Đổi mật khẩu
                        </h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Input
                                label="Mật khẩu hiện tại"
                                type="password"
                                placeholder="••••••••"
                            />
                            <Input
                                label="Mật khẩu mới"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                        <Button variant="secondary" className="mt-5">
                            Cập nhật mật khẩu
                        </Button>
                    </div>
                </section>
            </div>
            {notice && (
                <FlashAlert message={notice} onClose={() => setNotice("")} />
            )}
        </>
    );
}
