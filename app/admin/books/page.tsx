"use client";

import { useEffect, useState } from "react";
import { BookPlus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import {
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
import { bookService } from "@/services/book";
import { categoryService } from "@/services/category";
import { useAutoPermissions } from "@/components/PermissionProvider";
import { AccessDenied } from "@/components/AccessDenied";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL_IMAGE || "";

type Book = {
    id: number;
    title?: string;
    artworkUrl?: string | null;
    categoryId?: number;
    categoryName?: string;
    totalChapters?: number;
};

type CategoryOption = {
    label: string;
    value: string;
};

export default function BooksPage() {
    const { canAccess, loading: permissionsLoading } = useAutoPermissions();

    const canRead = canAccess("GET", "/book");
    const canCreate = canAccess("POST", "/book/create");
    const canUpdate = canAccess("PUT", "/book/:id");
    const canDelete = canAccess("DELETE", "/book/:id");

    const [items, setItems] = useState<Book[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [editing, setEditing] = useState<Book | null>(null);
    const [deleting, setDeleting] = useState<Book | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("");
    const [tone, setTone] = useState<"success" | "error" | "warning">("success");

    useEffect(() => {
        if (!permissionsLoading && canRead) {
            fetchBooks(page - 1);
            fetchCategories();
        }
    }, [page, canRead, permissionsLoading]);

    async function fetchCategories() {
        try {
            const res: any = await categoryService.list();
            const list = res?.content || res?.data || (Array.isArray(res) ? res : []);
            const options = list.map((cat: any) => ({
                label: cat.name || cat.title,
                value: String(cat.id),
            }));
            setCategories(options);
        } catch (error) {
            console.error("Lỗi lấy danh sách danh mục:", error);
        }
    }

    async function fetchBooks(pageIndex = 0) {
        try {
            setLoading(true);
            const res: any = await bookService.list({ page: pageIndex, size: 10 });

            const listData = res?.content || res?.data?.content || (Array.isArray(res) ? res : []);
            setItems(listData);

            const total = res?.totalPages || res?.data?.totalPages || 1;
            setTotalPages(total);
        } catch (error: any) {
            setNotice(error?.message || "Không thể tải danh sách sách!");
            setTone("error");
        } finally {
            setLoading(false);
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
        const bookTitle = item.title || "";
        const bookCat = item.categoryName || "";
        return `${bookTitle} ${bookCat}`.toLowerCase().includes(query.toLowerCase());
    });

    async function handleSave(values: Record<string, any>) {
        try {
            const payload = {
                title: values.title,
                totalChapters: values.totalChapters ? Number(values.totalChapters) : 0,
                categoryId: Number(values.categoryId),
                artworkUrl: values.artworkPath,
            };

            if (editing) {
                // await bookService.update(Number(editing.id), payload);
                setNotice("Đã cập nhật thông tin sách!");
            } else {
                await bookService.create(payload);
                setNotice("Đã thêm sách mới thành công!");
            }

            setTone("success");
            setOpen(false);
            setEditing(null);
            fetchBooks(page - 1);
        } catch (error: any) {
            setNotice(error?.message || "Thao tác thất bại!");
            setTone("error");
        }
    }

    async function handleRemove() {
        if (!deleting) return;

        try {
            // await bookService.remove(deleting.id);
            setNotice(`Đã xóa sách "${deleting.title}" thành công!`);
            setTone("success");
            setDeleting(null);
            fetchBooks(page - 1);
        } catch (error: any) {
            setNotice(error?.message || "Xóa sách thất bại!");
            setTone("error");
        }
    }

    return (
        <>
            <PageHeader
                title="Quản lý sách"
                description="Quản lý thông tin sách, ảnh bìa, bản dịch và trạng thái xuất bản"
                action={
                    canCreate ? (
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setOpen(true);
                            }}
                        >
                            <BookPlus className="h-4 w-4" />
                            Thêm sách
                        </Button>
                    ) : null
                }
            />

            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <h2 className="font-bold">
                        Danh sách sách{" "}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                            {filtered.length}
                        </span>
                    </h2>
                    <SearchBox
                        placeholder="Tìm tên sách"
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
                                    <th className={tableHeadClass}>Ảnh bìa</th>
                                    <th className={tableHeadClass}>Tên sách</th>
                                    <th className={tableHeadClass}>Danh mục</th>
                                    <th className={tableHeadClass}>Số chương</th>
                                    {(canUpdate || canDelete) && (
                                        <th className={tableHeadClass}>Thao tác</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-5 text-center text-sm text-slate-500"
                                        >
                                            Không tìm thấy sách nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => {
                                        const displayName = item.title || "N/A";
                                        const fullImageUrl = item.artworkUrl
                                            ? item.artworkUrl.startsWith("http")
                                                ? item.artworkUrl
                                                : `${IMAGE_BASE_URL}${item.artworkUrl}`
                                            : null;

                                        return (
                                            <tr
                                                className="border-t border-slate-100 dark:border-slate-800"
                                                key={item.id}
                                            >
                                                <td className={tableCellClass}>
                                                    {fullImageUrl ? (
                                                        <img
                                                            src={fullImageUrl}
                                                            alt={displayName}
                                                            className="h-12 w-9 rounded object-cover border border-slate-200 dark:border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-9 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                            <ImageIcon className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className={`${tableCellClass} font-semibold`}>
                                                    {displayName}
                                                </td>
                                                <td className={tableCellClass}>
                                                    {item.categoryName || "—"}
                                                </td>
                                                <td className={tableCellClass}>
                                                    {item.totalChapters ?? "—"}
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
                                                                aria-label={`Sửa ${displayName}`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                className="px-2 text-rose-600"
                                                                onClick={() => setDeleting(item)}
                                                                aria-label={`Xóa ${displayName}`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
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
                title={editing ? "Chỉnh sửa sách" : "Thêm sách"}
                description="Điền thông tin chi tiết và tải ảnh bìa cho sách."
                fields={[
                    {
                        key: "artworkPath",
                        label: "Ảnh bìa sách",
                        type: "file",
                        accept: "image/*",
                    },
                    {
                        key: "title",
                        label: "Tên sách",
                        placeholder: "Ví dụ: Sáng Thế Ký",
                    },
                    {
                        key: "categoryId",
                        label: "Danh mục",
                        placeholder: "Chọn danh mục",
                        options: categories,
                    },
                    {
                        key: "totalChapters",
                        label: "Tổng số chương",
                        type: "number",
                        placeholder: "Ví dụ: 50",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            title: editing.title || "",
                            categoryId: editing.categoryId ? String(editing.categoryId) : "",
                            totalChapters: editing.totalChapters ?? "",
                            artworkPath: editing.artworkUrl || "",
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo sách"}
                onClose={() => setOpen(false)}
                onSubmit={handleSave}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting ? `Xóa ${deleting.title}` : "sách này"}
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