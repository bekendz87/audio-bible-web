"use client";

import { AlertTriangle, CheckCircle2, FileWarning, Info, Loader2, OctagonAlert, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

export function LoadingState({
    label = "Đang tải dữ liệu...",
}: {
    label?: string;
}) {
    return (
        <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-200/70 bg-white/20 p-8 text-sm text-slate-500 dark:border-indigo-400/20 dark:bg-slate-900/20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            <span>{label}</span>
        </div>
    );
}

export function TableSkeleton({
    rows = 5,
    columns = 4,
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <div className="space-y-3 p-5" aria-label="Đang tải">
            <div className="skeleton h-5 w-36" />
            {Array.from({ length: rows }).map((_, row) => (
                <div className="grid gap-3 sm:grid-cols-4" key={row}>
                    {Array.from({ length: columns }).map((__, column) => (
                        <div className="skeleton h-10" key={column} />
                    ))}
                </div>
            ))}
        </div>
    );
}

const alertTone = {
    success: {
        icon: CheckCircle2,
        className:
            "border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    error: {
        icon: OctagonAlert,
        className:
            "border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300",
    },
    info: {
        icon: Info,
        className:
            "border-sky-200/70 bg-sky-50/80 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-300",
    },

    warning: {
        icon: TriangleAlert,
        className:
            "border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300",
    },
};

export function Alert({
    title,
    message,
    tone = "info",
    onClose,
}: {
    title?: string;
    message: string;
    tone?: keyof typeof alertTone;
    onClose?: () => void;
}) {
    const config = alertTone[tone];
    const Icon = config.icon;
    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-sm backdrop-blur-xl ${config.className}`}
        >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="font-bold">
                    {title ??
                        (tone === "error"
                            ? "Có lỗi xảy ra"
                            : tone === "success"
                                ? "Thành công"
                                : "Thông tin")}
                </p>
                <p className="mt-0.5 opacity-85">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                    aria-label="Đóng thông báo"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export function FlashAlert({
    message,
    tone = "success",
    duration = 3500,
    onClose,
}: {
    message: string;
    tone?: "success" | "error" | "info" | any;
    duration?: number;
    onClose?: () => void;
}) {
    useEffect(() => {
        const timeout = window.setTimeout(() => onClose?.(), duration);
        return () => window.clearTimeout(timeout);
    }, [duration, onClose]);
    return (
        <div className="fixed right-5 top-5 z-[9999] w-[min(380px,calc(100vw-2.5rem))] animate-in">
            <Alert message={message} tone={tone} onClose={onClose} />
        </div>
    );
}

export function Modal({
    open,
    title,
    description,
    children,
    onClose,
    footer,
}: {
    open: boolean;
    title: string;
    description?: string;
    children: React.ReactNode;
    onClose: () => void;
    footer?: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="modal-root fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <button
                className="modal-backdrop absolute inset-0 z-0 h-full w-full bg-slate-950/55 backdrop-blur-md"
                onClick={onClose}
                aria-label="Đóng modal"
            />
            <div className="glass-panel modal-card relative z-10 max-h-[min(720px,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold">{title}</h2>
                        {description && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-6">{children}</div>
                {footer && (
                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/60 pt-5 dark:border-slate-700/60">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
