"use client";

import { useEffect, useState } from "react";
import { FlashAlert } from "@/components/admin/feedback";

const ignoredLabels = [
    "Mở menu",
    "Đóng menu",
    "Toggle Theme",
    "Đăng xuất",
    "Trang trước",
    "Trang sau",
    "Thêm",
    "Tạo",
    "Sửa",
    "Xóa",
    "Chỉnh sửa",
    "Chi tiết",
    "Hủy",
    "Đã hiểu",
    "Xác nhận",
    "Lưu thay đổi",
    "Cập nhật",
    "Chọn",
];

export function ActionFeedback({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState("");
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const button = target.closest("button");
            if (
                !button ||
                button.hasAttribute("aria-label") ||
                button.closest("[data-feedback-ignore], [role='listbox']")
            )
                return;
            const label =
                button.getAttribute("aria-label") ??
                button.textContent?.trim() ??
                "Thao tác";
            if (
                ignoredLabels.some((item) => label.includes(item)) ||
                /^\d+$/.test(label)
            )
                return;
            setMessage(
                `Đã ghi nhận thao tác “${label.slice(0, 42)}”. Chức năng sẽ gọi backend ở bước tích hợp tiếp theo.`,
            );
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);
    return (
        <>
            {children}
            {message && (
                <FlashAlert
                    message={message}
                    tone="success"
                    onClose={() => setMessage("")}
                />
            )}
        </>
    );
}
