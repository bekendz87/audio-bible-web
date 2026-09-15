"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/admin/ui";
import { FlashAlert, Modal } from "@/components/admin/feedback";

export function DemoActionButton({
    children,
    message,
    variant = "primary",
    modal = false,
    className = "",
}: {
    children: React.ReactNode;
    message?: string;
    variant?: ButtonVariant;
    modal?: boolean;
    className?: string;
}) {
    const [notice, setNotice] = useState(false);
    const [open, setOpen] = useState(false);
    const text =
        message ?? "Thao tác đã được ghi nhận. Sẵn sàng kết nối backend.";
    return (
        <div data-feedback-ignore>
            <Button
                variant={variant}
                className={className}
                onClick={() => (modal ? setOpen(true) : setNotice(true))}
            >
                {children}
            </Button>
            {notice && (
                <FlashAlert message={text} onClose={() => setNotice(false)} />
            )}
            <Modal
                open={open}
                title="Tính năng sẵn sàng"
                description={text}
                onClose={() => setOpen(false)}
                footer={
                    <Button
                        onClick={() => {
                            setOpen(false);
                            setNotice(true);
                        }}
                    >
                        Đã hiểu
                    </Button>
                }
            >
                <div className="rounded-2xl bg-indigo-50/70 p-4 text-sm leading-6 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
                    Giao diện đã sẵn sàng. Khi endpoint backend được kết nối,
                    thao tác này sẽ thực hiện thật.
                </div>
            </Modal>
        </div>
    );
}
