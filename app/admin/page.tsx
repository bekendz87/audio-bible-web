"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    BookOpen,
    Calendar,
    Headphones,
    ShieldCheck,
    TrendingUp,
    Users,
} from "lucide-react";
import {
    PageHeader,
    StatCard,
    TableCard,
    Badge,
    tableCellClass,
    tableHeadClass,
} from "@/components/admin/ui";
import { DemoActionButton } from "@/components/admin/actions";

const activities = [
    [
        "Nguyễn Minh Anh",
        "Cập nhật sách Tân Ước",
        "2 phút trước",
        "success" as const,
    ],
    [
        "Trần Hoàng Nam",
        "Tạo người dùng mới",
        "18 phút trước",
        "neutral" as const,
    ],
    ["Lê Thu Hà", "Thay đổi quyền Editor", "1 giờ trước", "warning" as const],
    [
        "Phạm Đức Long",
        "Thêm chương Sáng Thế Ký 01",
        "3 giờ trước",
        "success" as const,
    ],
];

export default function DashboardPage() {
    const [currentDate, setCurrentDate] = useState<string>("");

    useEffect(() => {

        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(now);
        setCurrentDate(formattedDate);
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tổng quan"
                description="Theo dõi nhanh tình hình vận hành Audio Bible hôm nay"
                action={
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span>{currentDate || "Đang tải ngày..."}</span>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Tổng người dùng"
                    value="12,840"
                    trend="12.5%"
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    label="Sách Kinh Thánh"
                    value="66"
                    trend="4.2%"
                    icon={<BookOpen className="h-5 w-5" />}
                    color="emerald"
                />
                <StatCard
                    label="Lượt nghe hôm nay"
                    value="8,492"
                    trend="18.7%"
                    icon={<Headphones className="h-5 w-5" />}
                    color="amber"
                />
                <StatCard
                    label="Vai trò & quyền"
                    value="24"
                    trend="2.1%"
                    icon={<ShieldCheck className="h-5 w-5" />}
                    color="rose"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <TableCard>
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                Hoạt động gần đây
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Các thay đổi mới nhất trong hệ thống
                            </p>
                        </div>
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
                        {activities.map(([name, action, time, tone]) => (
                            <div
                                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                key={`${name}-${time}`}
                            >
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-200 dark:shadow-none">
                                    {name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .slice(-2)
                                        .join("")}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {name}
                                    </p>
                                    <p className="truncate text-xs text-slate-400">{action}</p>
                                </div>
                                <div className="text-right">
                                    <Badge tone={tone}>
                                        {tone === "success"
                                            ? "Đã cập nhật"
                                            : tone === "warning"
                                                ? "Cần xem"
                                                : "Mới"}
                                    </Badge>
                                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                                        {time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </TableCard>

                <TableCard>
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                Phân bổ nội dung
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Tình trạng nội dung hiện tại
                            </p>
                        </div>
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="space-y-5 p-6">
                        {[
                            ["Audio đã hoàn thiện", "78%", "bg-indigo-500"],
                            ["Đã có bản dịch", "92%", "bg-emerald-500"],
                            ["Đang chờ duyệt", "14%", "bg-amber-500"],
                            ["Lỗi cần xử lý", "3%", "bg-rose-500"],
                        ].map(([label, value, color]) => (
                            <div key={label}>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {label}
                                    </span>
                                    <strong className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {value}
                                    </strong>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                                        style={{ width: value }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </TableCard>
            </div>

            <TableCard>
                <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        Sách được nghe nhiều
                    </h2>
                </div>
                <div className="table-scroll">
                    <table className="admin-table w-full min-w-160 text-left">
                        <thead>
                            <tr>
                                <th className={tableHeadClass}>Tên sách</th>
                                <th className={tableHeadClass}>Số chương</th>
                                <th className={tableHeadClass}>Lượt nghe</th>
                                <th className={tableHeadClass}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["Thi Thiên", "150", "24,830", "success" as const],
                                ["Châm Ngôn", "31", "18,420", "success" as const],
                                ["Phúc Âm Giăng", "21", "15,102", "warning" as const],
                            ].map(([book, chapters, plays, tone]) => (
                                <tr
                                    className="border-t border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                                    key={book}
                                >
                                    <td className={`${tableCellClass} font-semibold text-slate-800 dark:text-slate-200`}>
                                        {book}
                                    </td>
                                    <td className={tableCellClass}>{chapters}</td>
                                    <td className={`${tableCellClass} font-medium`}>{plays}</td>
                                    <td className={tableCellClass}>
                                        <Badge tone={tone}>
                                            {tone === "success" ? "Đang hoạt động" : "Đang cập nhật"}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end border-t border-slate-100 px-6 py-3.5 dark:border-slate-800">
                    <DemoActionButton variant="ghost">Xem báo cáo</DemoActionButton>
                </div>
            </TableCard>
        </div>
    );
}