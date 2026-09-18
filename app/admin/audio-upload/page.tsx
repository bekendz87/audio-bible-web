"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
    CheckCircle2,
    FileAudio,
    Headphones,
    UploadCloud,
    Loader2,
    History,
    Upload,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    ShieldAlert
} from "lucide-react";
import { Button, PageHeader, Select, TableCard } from "@/components/admin/ui";
import { FlashAlert } from "@/components/admin/feedback";
import { bookService } from "@/services/book";
import { chapterService } from "@/services/chapters";
import { uploadService } from "@/services/upload";
import { useAutoPermissions } from "@/components/PermissionProvider";
import { AccessDenied } from "@/components/AccessDenied";
import { getAudioDuration } from "@/lib/role-helper";

type SelectOption = {
    label: string;
    value: string;
};

type ChapterAudioItem = {
    id: string | number;
    bookName: string;
    title: string;
    chapterNumber?: number;
    audioUrl?: string;
    updatedAt?: string;
};

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL_IMAGE || "";

export default function AudioUploadPage() {
    const { canAccess, loading: permissionsLoading } = useAutoPermissions();

    const canViewUpload = canAccess("GET", "/track/audio-upload");
    const canUpload = canAccess("POST", "/upload/audio");
    const canReadBooks = canAccess("GET", "/book");

    const [books, setBooks] = useState<SelectOption[]>([]);
    const [chapters, setChapters] = useState<SelectOption[]>([]);
    const [selectedBookId, setSelectedBookId] = useState("");
    const [selectedChapterId, setSelectedChapterId] = useState("");

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");

    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [historyChapters, setHistoryChapters] = useState<ChapterAudioItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const [notice, setNotice] = useState("");
    const [tone, setTone] = useState<"success" | "error" | "warning">("success");

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    useEffect(() => {
        if (!permissionsLoading && canReadBooks) {
            fetchBooks();
        }
    }, [permissionsLoading, canReadBooks]);

    useEffect(() => {
        if (selectedBookId) {
            fetchChapters(selectedBookId);
        } else {
            setChapters([]);
            setSelectedChapterId("");
            setHistoryChapters([]);
            setTotalPages(1);
        }
    }, [selectedBookId]);

    useEffect(() => {
        fetchChapterHistory(currentPage);
    }, [currentPage]);

    async function fetchBooks() {
        try {
            setLoadingBooks(true);
            const res: any = await bookService.list({ page: 0, size: 100 });
            const listData = res?.content || res?.data?.content || (Array.isArray(res) ? res : []);

            const options = listData.map((b: any) => ({
                label: b.title || b.name,
                value: String(b.id),
            }));
            setBooks(options);
        } catch (error: any) {
            console.error("Lỗi lấy danh sách sách:", error);
            setNotice("Không thể tải danh sách sách!");
            setTone("error");
        } finally {
            setLoadingBooks(false);
        }
    }

    async function fetchChapters(bookId: string) {
        try {
            setLoadingChapters(true);
            setSelectedChapterId("");
            const res: any = await chapterService.byBook(Number(bookId));
            const listData = res?.content || res?.data || (Array.isArray(res) ? res : []);
            const options = listData.map((c: any) => ({
                label: c.chapterNumber ? `Chương ${c.chapterNumber}: ${c.title || ""}` : c.title || String(c.id),
                value: String(c.id),
            }));
            setChapters(options);
        } catch (error: any) {
            console.error("Lỗi lấy danh sách chương:", error);
            setNotice("Không thể tải danh sách chương của sách này!");
            setTone("error");
        } finally {
            setLoadingChapters(false);
        }
    }

    async function fetchChapterHistory(page: number) {
        try {
            setLoadingHistory(true);
            const res: any = await chapterService.listByBookWithAudio?.({ page: page - 1, size: pageSize, });
            if (res) {
                setHistoryChapters(res?.content || res?.data?.content || res?.data || []);
                setTotalPages(res?.totalPages || res?.data?.totalPages || 1);
            }
        } catch (error: any) {
            console.error("Lỗi lấy lịch sử audio chương:", error);
        } finally {
            setLoadingHistory(false);
        }
    }

    function chooseBook(value: string) {
        setSelectedBookId(value);
        setCurrentPage(1);
    }

    function chooseFile(event: ChangeEvent<HTMLInputElement>) {
        if (!canUpload) return;

        const selected = event.target.files?.[0];
        if (!selected) {
            return;
        }

        if (!selected.type.startsWith("audio/")) {
            setNotice("Vui lòng chọn file audio hợp lệ (MP3, WAV, M4A...).");
            setTone("error");
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    }

    async function handleConfirmUpload() {
        if (!canUpload) {
            setNotice("Bạn không có quyền để upload audio.");
            setTone("error");
            return;
        }

        if (!selectedBookId || !selectedChapterId || !file) {
            setNotice("Hãy chọn sách, chương và file audio trước khi xác nhận.");
            setTone("error");
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(10);

            const durationStr = await getAudioDuration(file);

            const resUpload: any = await uploadService.uploadAudio(file, (progressEvent: any) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(Math.min(percent, 90));
                }
            });

            const audioPath =
                resUpload?.path ||
                resUpload?.url ||
                resUpload?.data?.path ||
                resUpload?.data?.url ||
                (typeof resUpload === "string" ? resUpload : "");

            if (!audioPath) {
                throw new Error("Không nhận được đường dẫn audio sau khi tải lên!");
            }

            await chapterService.update(Number(selectedChapterId), {
                audioUrl: audioPath,
                duration: durationStr,
                bookId: selectedBookId
            });

            setUploadProgress(100);
            setNotice("Đã tải lên và lưu audio thành công!");
            setTone("success");

            setFile(null);
            setPreview("");
            setUploadProgress(0);

            fetchChapterHistory(currentPage);
        } catch (error: any) {
            console.error("Lỗi upload audio:", error);
            setNotice(error?.message || "Tải audio lên thất bại!");
            setTone("error");
        } finally {
            setUploading(false);
        }
    }

    function handleSelectChapterForReupload(chapterId: string) {
        setSelectedChapterId(chapterId);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (permissionsLoading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!canViewUpload) {
        return <AccessDenied />;
    }

    const selectedBookLabel = books.find((b) => b.value === selectedBookId)?.label;
    const selectedChapterLabel = chapters.find((c) => c.value === selectedChapterId)?.label;

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
                            value={selectedBookId}
                            onChange={chooseBook}
                            placeholder={loadingBooks ? "Đang tải danh sách..." : "Chọn sách"}
                        />

                        <Select
                            label="Chương *"
                            options={chapters}
                            value={selectedChapterId}
                            onChange={setSelectedChapterId}
                            placeholder={
                                loadingChapters
                                    ? "Đang tải danh sách..."
                                    : selectedBookId
                                        ? "Chọn chương"
                                        : "Vui lòng chọn sách trước"
                            }
                        />

                        {canUpload ? (
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                <span className="mb-2 block">File audio *</span>
                                <span className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/35 p-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60 dark:border-indigo-400/25 dark:bg-indigo-500/5">
                                    <UploadCloud className="h-7 w-7 text-indigo-500" />
                                    <span className="text-sm font-semibold">
                                        Kéo thả hoặc chọn file audio
                                    </span>
                                    <span className="text-xs font-normal text-slate-500">
                                        MP3 · tối đa 100MB
                                    </span>
                                    <input
                                        type="file"
                                        accept="audio/mpeg, .mp3"
                                        className="sr-only"
                                        onChange={chooseFile}
                                        disabled={uploading}
                                    />
                                </span>
                            </label>
                        ) : (
                            <div className="space-y-2">
                                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    File audio *
                                </span>
                                <div className="flex min-h-32 cursor-not-allowed flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 p-5 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
                                    <ShieldAlert className="h-7 w-7 text-rose-500" />
                                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                                        Bạn không có quyền để upload audio
                                    </span>
                                    <span className="text-xs text-rose-500/80">
                                        Vui lòng liên hệ quản trị viên để được cấp quyền thực hiện thao tác này.
                                    </span>
                                </div>
                            </div>
                        )}

                        {file && (
                            <div className="flex items-center gap-3 rounded-xl bg-slate-100/70 p-3 text-sm dark:bg-slate-800/60">
                                <FileAudio className="h-5 w-5 text-indigo-500" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{file.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                        )}

                        {uploading && uploadProgress > 0 && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Đang tải lên...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-200"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {canUpload ? (
                            <Button
                                className="w-full"
                                onClick={handleConfirmUpload}
                                disabled={uploading || !file || !selectedChapterId}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        Xác nhận lưu audio
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-100/70 p-3 text-sm font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>Bạn không có quyền để upload audio</span>
                            </div>
                        )}
                    </div>
                </TableCard>

                <div className="space-y-6">
                    <TableCard>
                        <div className="border-b border-slate-200/60 p-5 dark:border-slate-700/60">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15">
                                    <Headphones className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="font-bold">Nghe thử</h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Kiểm tra âm thanh trước khi xác nhận
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex min-h-52 flex-col items-center justify-center gap-4 p-6 text-center">
                            {preview ? (
                                <>
                                    <div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15">
                                        <Headphones className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            {selectedBookLabel || "Audio đã chọn"}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {selectedChapterLabel || "Chưa chọn chương"}
                                        </p>
                                    </div>
                                    <audio className="w-full max-w-md" controls controlsList="nodownload" src={preview}>
                                        Trình duyệt không hỗ trợ phát audio.
                                    </audio>
                                </>
                            ) : (
                                <>
                                    <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                                        <Headphones className="h-8 w-8" />
                                    </div>
                                    <p className="max-w-xs text-sm text-slate-500">
                                        Chọn một audio để bắt đầu nghe thử.
                                    </p>
                                </>
                            )}
                        </div>
                    </TableCard>

                    <TableCard>
                        <div className="flex items-center justify-between border-b border-slate-200/60 p-5 dark:border-slate-700/60">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15">
                                    <History className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="font-bold">Danh sách chương đã có audio</h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Lịch sử audio đã tải lên và chỉnh sửa theo sách
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loadingHistory ? (
                                <div className="flex h-40 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                </div>
                            ) : historyChapters.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    Chưa có chương nào hoặc chưa có dữ liệu audio.
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-4 py-3">Sách</th>
                                            <th className="px-4 py-3">Chương</th>
                                            <th className="px-4 py-3">Nghe trực tiếp</th>
                                            <th className="px-4 py-3 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                                        {historyChapters.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="px-4 py-3 font-medium">
                                                    {item.bookName}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.audioUrl ? (
                                                        <audio className="h-8 w-80" controls controlsList="nodownload" src={IMAGE_BASE_URL + item.audioUrl} />
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Trống</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        className="text-xs"
                                                        onClick={() => handleSelectChapterForReupload(String(item.id))}
                                                    >
                                                        <Upload className="mr-1 h-3.5 w-3.5" />
                                                        {item.audioUrl ? "Thay audio" : "Upload"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {selectedBookId && totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-200/60 px-4 py-3 dark:border-slate-700/60">
                                <span className="text-xs text-slate-500">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        disabled={currentPage <= 1 || loadingHistory}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        disabled={currentPage >= totalPages || loadingHistory}
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TableCard>
                </div>
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