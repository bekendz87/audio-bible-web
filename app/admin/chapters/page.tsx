"use client";

import { useEffect, useState } from "react";
import { FilePlus2, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    Badge,
    Button,
    PageHeader,
    Pagination,
    SearchBox,
    TableCard,
    tableCellClass,
    tableHeadClass,
} from "@/components/admin/ui";
import { ConfirmModal, EntityModal } from "@/components/admin/crud";
import { FlashAlert } from "@/components/admin/feedback";
import { chapterService } from "@/services/chapters";
import { bookService } from "@/services/book";
import { useAutoPermissions } from "@/components/PermissionProvider";
import { AccessDenied } from "@/components/AccessDenied";

type Chapter = {
    id: number;
    bookId?: number;
    bookName?: string;
    reader?: string;
    title?: string;
    audioUrl?: string | null;
    duration?: string;
    remove?: boolean;
};

export default function ChaptersPage() {
    const { canAccess, loading: permissionsLoading } = useAutoPermissions();

    const canRead = canAccess("GET", "/chapters");
    const canCreate = canAccess("POST", "/chapters/created");
    const canUpdate = canAccess("PUT", "/chapters/updated/:id");
    const canDelete = canAccess("DELETE", "/chapters/delete/:id");

    const [items, setItems] = useState<Chapter[]>([]);
    const [books, setBooks] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [editing, setEditing] = useState<Chapter | null>(null);
    const [deleting, setDeleting] = useState<Chapter | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("");
    const [tone, setTone] = useState<"success" | "error" | "warning">("success");

    useEffect(() => {
        if (!permissionsLoading && canRead) {
            fetchChapters(page - 1);
            fetchBooks();
        }
    }, [page, canRead, permissionsLoading]);

    async function fetchChapters(pageIndex = 0) {
        try {
            setLoading(true);
            const res: any = await chapterService.list({ page: pageIndex, size: 10 });

            const listData = res?.content || res?.data?.content || (Array.isArray(res) ? res : []);
            setItems(listData);

            const total = res?.totalPages || res?.data?.totalPages || 1;
            setTotalPages(total);

            const totalCount = res?.totalElements ?? res?.data?.totalElements ?? listData.length;
            setTotalElements(totalCount);
        } catch (error: any) {
            setNotice(error?.message || "Không thể tải danh sách chương!");
            setTone("error");
        } finally {
            setLoading(false);
        }
    }

    async function fetchBooks() {
        try {
            const res: any = await bookService.list();
            const data = res?.content || res?.data || (Array.isArray(res) ? res : []);
            if (Array.isArray(data)) {
                setBooks(
                    data.map((b: any) => ({
                        label: b.title || b.name || `Sách #${b.id}`,
                        value: String(b.id),
                    }))
                );
            }
        } catch (error) {
            console.error("Không thể tải danh sách sách:", error);
        }
    }

    if (permissionsLoading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!canRead) {
        return <AccessDenied />;
    }

    const filtered = items.filter((item) => {
        const searchText = `${item.bookName || ""} ${item.id || ""} ${item.title || ""}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });

    async function handleSave(values: Record<string, string>) {
        try {
            const payload = {
                bookId: Number(values.bookId),
                title: values.title,
                reader: values.reader
            };

            if (editing) {
                await chapterService.update(Number(editing.id), payload);
                setNotice("Cập nhật chương thành công!");
            } else {
                await chapterService.create(payload);
                setNotice("Thêm chương mới thành công!");
            }

            setTone("success");
            setOpen(false);
            setEditing(null);
            fetchChapters(page - 1);
        } catch (error: any) {
            setNotice(error?.message || "Thao tác thất bại!");
            setTone("error");
        }
    }

    async function handleRemove() {
        if (!deleting) {
            return;
        }

        try {
            await chapterService.remove(deleting.id);
            setNotice(`Đã xóa chương thành công!`);
            setTone("success");
            setDeleting(null);
            fetchChapters(page - 1);
        } catch (error: any) {
            setNotice(error?.message || "Xóa chương thất bại!");
            setTone("error");
        }
    }

    return (
        <>
            <PageHeader
                title="Quản lý chương"
                description="Quản lý nội dung, audio và bản dịch theo từng chương"
                action={
                    canCreate ? (
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setOpen(true);
                            }}
                        >
                            <FilePlus2 className="h-4 w-4" />
                            Thêm chương
                        </Button>
                    ) : null
                }
            />

            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <h2 className="font-bold">
                        Danh sách chương{" "}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                            {query ? `${filtered.length} / ${totalElements}` : totalElements}
                        </span>
                    </h2>
                    <SearchBox
                        placeholder="Tìm chương hoặc sách"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>

                <div className="table-scroll">
                    {loading ? (
                        <div className="flex min-h-[200px] items-center justify-center">
                            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <table className="admin-table w-full min-w-175 text-left">
                            <thead>
                                <tr>
                                    <th className={tableHeadClass}>Sách</th>
                                    <th className={tableHeadClass}>Tiêu đề</th>
                                    <th className={tableHeadClass}>Người đọc</th>
                                    <th className={tableHeadClass}>Thời lượng</th>
                                    <th className={tableHeadClass}>Trạng thái audio</th>
                                    {(canUpdate || canDelete) && (
                                        <th className={tableHeadClass}>Thao tác</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-5 text-center text-sm text-slate-500"
                                        >
                                            Không tìm thấy chương nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr
                                            className="border-t border-slate-100 dark:border-slate-800"
                                            key={item.id}
                                        >
                                            <td className={`${tableCellClass} font-semibold`}>
                                                {item.bookName || `Sách #${item.bookId || "N/A"}`}
                                            </td>

                                            <td className={tableCellClass}>{item.title || "—"}</td>
                                            <td className={tableCellClass}>{item.reader || "—"}</td>
                                            <td className={tableCellClass}>{item.duration || "—"}</td>
                                            <td className={tableCellClass}>
                                                <Badge tone={item.audioUrl ? "success" : "warning"}>
                                                    {item.audioUrl ? "Đã có audio" : "Chờ upload"}
                                                </Badge>
                                            </td>
                                            {(canUpdate || canDelete) && (
                                                <td className={`${tableCellClass} flex gap-2`}>
                                                    {canUpdate && (
                                                        <Button
                                                            variant="ghost"
                                                            className="px-2"
                                                            onClick={() => {
                                                                setEditing(item);
                                                                setOpen(true);
                                                            }}
                                                            aria-label={`Sửa chương ${item.id}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            className="px-2 text-rose-600"
                                                            onClick={() => setDeleting(item)}
                                                            aria-label={`Xóa chương ${item.id}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </TableCard>

            <EntityModal
                open={open}
                title={editing ? "Chỉnh sửa chương" : "Thêm chương"}
                description="Điền thông tin chi tiết chương sách bên dưới."
                fields={[
                    {
                        key: "bookId",
                        label: "Sách",
                        placeholder: "Chọn sách",
                        options: books,
                    },
                    {
                        key: "title",
                        label: "Tên/Tiêu đề chương",
                        placeholder: "Nhập tiêu đề (nếu có)",
                    },
                    {
                        key: "reader",
                        label: "Người đọc",
                        placeholder: "Nhập người đọc (nếu có)",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            bookId: String(editing.bookId || ""),
                            id: String(editing.id || ""),
                            title: (editing.title || ""),
                            reader: (editing.reader || "")
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo chương"}
                onClose={() => setOpen(false)}
                onSubmit={handleSave}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                itemName={
                    deleting ? `Xóa ${deleting.title}` : "chương này"
                }
                onClose={() => setDeleting(null)}
                onConfirm={handleRemove}
            />

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