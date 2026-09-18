"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
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
import { categoryService } from "@/services/category";
import { useAutoPermissions } from "@/components/PermissionProvider";
import { AccessDenied } from "@/components/AccessDenied";

type Category = {
    id: number;
    name: string;
    description?: string;
    bookCount?: number;
};

export default function CategoriesPage() {
    const { canAccess, loading: permissionsLoading } = useAutoPermissions();

    const canRead = canAccess("GET", "/category");
    const canCreate = canAccess("POST", "/category/create");
    const canUpdate = canAccess("PUT", "/category/:id");
    const canDelete = canAccess("DELETE", "/category/:id");

    const [items, setItems] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [editing, setEditing] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState<Category | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("");
    const [tone, setTone] = useState<"success" | "error" | "warning">("success");

    useEffect(() => {
        if (!permissionsLoading && canRead) {
            fetchCategories(page - 1);
        }
    }, [page, canRead, permissionsLoading]);

    async function fetchCategories(pageIndex = 0) {
        try {
            setLoading(true);
            const res: any = await categoryService.list({ page: pageIndex, size: 10 });

            const listData = res?.content || res?.data?.content || (Array.isArray(res) ? res : []);
            setItems(listData);

            const total = res?.totalPages || res?.data?.totalPages || 1;
            setTotalPages(total);
        } catch (error: any) {
            setNotice(error?.message || "Không thể tải danh sách danh mục!");
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

    const filtered = items.filter((item) =>
        (item.name || "").toLowerCase().includes(query.toLowerCase())
    );

    async function handleSave(values: Record<string, any>) {
        try {
            const payload = {
                name: values.name,
                description: values.description || "",
            };

            if (editing) {
                await categoryService.update(Number(editing.id), payload);
                setNotice("Đã cập nhật thông tin danh mục!");
            } else {
                await categoryService.create(payload);
                setNotice("Đã thêm danh mục mới thành công!");
            }

            setTone("success");
            setOpen(false);
            setEditing(null);
            fetchCategories(page - 1);
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
           await categoryService.remove(deleting.id);
            setNotice(`Đã xóa danh mục "${deleting.name}" thành công!`);
            setTone("success");
            setDeleting(null);
            fetchCategories(page - 1);
        } catch (error: any) {
            setNotice(error?.message || "Xóa danh mục thất bại!");
            setTone("error");
        }
    }

    return (
        <>
            <PageHeader
                title="Quản lý danh mục"
                description="Phân loại sách và nội dung audio trong hệ thống"
                action={
                    canCreate ? (
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setOpen(true);
                            }}
                        >
                            <FolderPlus className="h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    ) : null
                }
            />

            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <h2 className="font-bold">
                        Tất cả danh mục{" "}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                            ({filtered.length})
                        </span>
                    </h2>
                    <SearchBox
                        placeholder="Tìm danh mục..."
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
                                    <th className={tableHeadClass}>Tên danh mục</th>
                                    <th className={tableHeadClass}>Mô tả</th>
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
                                            Không tìm thấy danh mục nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr
                                            className="border-t border-slate-100 dark:border-slate-800"
                                            key={item.id}
                                        >
                                            <td className={`${tableCellClass} font-semibold`}>
                                                {item.name}
                                            </td>
                                            <td className={tableCellClass}>
                                                {item.description || "—"}
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
                                                            aria-label={`Sửa ${item.name}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            className="px-2 text-rose-600"
                                                            onClick={() => setDeleting(item)}
                                                            aria-label={`Xóa ${item.name}`}
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
                title={editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
                description="Nhập thông tin danh mục để quản lý trong hệ thống."
                fields={[
                    {
                        key: "name",
                        label: "Tên danh mục",
                        placeholder: "Ví dụ: Cựu Ước",
                    },
                    {
                        key: "description",
                        label: "Mô tả danh mục",
                        placeholder: "Mô tả ngắn về danh mục...",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            name: editing.name || "",
                            description: editing.description || "",
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo danh mục"}
                onClose={() => setOpen(false)}
                onSubmit={handleSave}
            />

            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting ? `danh mục "${deleting.name}"` : "danh mục này"}
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