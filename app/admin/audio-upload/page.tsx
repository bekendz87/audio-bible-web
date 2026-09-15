"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { CheckCircle2, FileAudio, Headphones, UploadCloud } from "lucide-react";
import { Button, PageHeader, Select, TableCard } from "@/components/admin/ui";
import { FlashAlert } from "@/components/admin/feedback";

const books = [
    { label: "Sáng Thế Ký", value: "Sáng Thế Ký" },
    { label: "Phúc Âm Giăng", value: "Phúc Âm Giăng" },
    { label: "Rô-ma", value: "Rô-ma" },
];
const chapters: Record<string, { label: string; value: string }[]> = {
    "Sáng Thế Ký": [
        { label: "Chương 01", value: "Chương 01" },
        { label: "Chương 02", value: "Chương 02" },
    ],
    "Phúc Âm Giăng": [{ label: "Chương 03", value: "Chương 03" }],
    "Rô-ma": [{ label: "Chương 01", value: "Chương 01" }],
};

export default function AudioUploadPage() {
    const [book, setBook] = useState("");
    const [chapter, setChapter] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [notice, setNotice] = useState("");
    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview);
        },
        [preview],
    );
    function chooseBook(value: string) {
        setBook(value);
        setChapter("");
    }
    function chooseFile(event: ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0];
        if (!selected) return;
        if (!selected.type.startsWith("audio/")) {
            setNotice("Vui lòng chọn file audio hợp lệ.");
            return;
        }
        if (preview) URL.revokeObjectURL(preview);
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    }
    function confirm() {
        if (!book || !chapter || !file) {
            setNotice(
                "Hãy chọn sách, chương và file audio trước khi xác nhận.",
            );
            return;
        }
        setNotice(
            `Đã xác nhận audio cho ${book} - ${chapter}. Dữ liệu đang mô phỏng, chưa đẩy xuống backend.`,
        );
    }
    return (
        <>
            <PageHeader
                title="Upload audio"
                description="Chọn sách, chương và tải audio lên để nghe thử trước khi xác nhận lưu trữ"
            />
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <TableCard>
                    <div className="border-b border-slate-200/60 p-5 dark:border-slate-700/60">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15">
                                <UploadCloud className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-bold">Thông tin audio</h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Các trường có dấu * là bắt buộc
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-5 p-5">
                        <Select
                            label="Sách *"
                            options={books}
                            value={book}
                            placeholder="Chọn sách"
                            onChange={chooseBook}
                        />
                        <Select
                            label="Chương *"
                            options={chapters[book] ?? []}
                            value={chapter}
                            placeholder={
                                book ? "Chọn chương" : "Chọn sách trước"
                            }
                            onChange={setChapter}
                        />
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <span className="mb-2 block">File audio *</span>
                            <span className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/35 p-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60 dark:border-indigo-400/25 dark:bg-indigo-500/5">
                                <UploadCloud className="h-7 w-7 text-indigo-500" />
                                <span className="text-sm font-semibold">
                                    Kéo thả hoặc chọn file audio
                                </span>
                                <span className="text-xs font-normal text-slate-500">
                                    MP3, WAV, M4A · tối đa 100MB
                                </span>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="sr-only"
                                    onChange={chooseFile}
                                />
                            </span>
                        </label>
                        {file && (
                            <div className="flex items-center gap-3 rounded-xl bg-slate-100/70 p-3 text-sm dark:bg-slate-800/60">
                                <FileAudio className="h-5 w-5 text-indigo-500" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                        )}
                        <Button className="w-full" onClick={confirm}>
                            <CheckCircle2 className="h-4 w-4" />
                            Xác nhận lưu audio
                        </Button>
                    </div>
                </TableCard>
                <TableCard>
                    <div className="border-b border-slate-200/60 p-5 dark:border-slate-700/60">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15">
                                <Headphones className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-bold">Nghe thử</h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Kiểm tra audio trước khi xác nhận
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex min-h-72 flex-col items-center justify-center gap-5 p-6 text-center">
                        {preview ? (
                            <>
                                <div className="grid h-20 w-20 place-items-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15">
                                    <Headphones className="h-9 w-9" />
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {book || "Audio đã chọn"}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {chapter || "Chưa chọn chương"}
                                    </p>
                                </div>
                                <audio
                                    className="w-full max-w-md"
                                    controls
                                    src={preview}
                                >
                                    Trình duyệt không hỗ trợ phát audio.
                                </audio>
                            </>
                        ) : (
                            <>
                                <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                                    <Headphones className="h-9 w-9" />
                                </div>
                                <p className="max-w-xs text-sm text-slate-500">
                                    Chọn một file audio để hiển thị trình phát
                                    nghe thử.
                                </p>
                            </>
                        )}
                    </div>
                </TableCard>
            </div>
            {notice && (
                <FlashAlert
                    message={notice}
                    tone={notice.startsWith("Đã") ? "success" : "error"}
                    onClose={() => setNotice("")}
                />
            )}
        </>
    );
}
