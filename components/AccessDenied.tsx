"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/admin/ui";

interface AccessDeniedProps {
    title?: string;
    description?: string;
}

export function AccessDenied({
    title = "Không có quyền truy cập",
    description = "Bạn không có quyền xem hoặc thực hiện thao tác trên trang này. Vui lòng liên hệ Quản trị viên để biết thêm chi tiết.",
}: AccessDeniedProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                {title}
            </h2>
            <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {description}
            </p>
            <Link href="/admin">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại Trang chủ
                </Button>
            </Link>
        </div>
    );
}