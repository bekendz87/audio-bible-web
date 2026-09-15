"use client";

import { useState } from "react";
import { FolderPlus, Pencil, Trash2 } from "lucide-react";
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

type Category = {
    id: number;
    name: string;
    count: string;
    type: string;
    tone: "success" | "warning";
};
const initialCategories: Category[] = [
    {
        id: 1,
        name: "Cựu Ước",
        count: "39",
        type: "Nội dung Kinh Thánh",
        tone: "success",
    },
    {
        id: 2,
        name: "Tân Ước",
        count: "27",
        type: "Nội dung Kinh Thánh",
        tone: "success",
    },
    {
        id: 3,
        name: "Bài học Kinh Thánh",
        count: "18",
        type: "Audio series",
        tone: "warning",
    },
    {
        id: 4,
        name: "Suy ngẫm mỗi ngày",
        count: "12",
        type: "Audio series",
        tone: "success",
    },
];

export default function CategoriesPage() {
    const [items, setItems] = useState(initialCategories);
    const [editing, setEditing] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState<Category | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("");
    const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
    );
    function save(values: Record<string, string>) {
        const item: Category = {
            id: editing?.id ?? Date.now(),
            name: values.name,
            count: values.count || "0",
            type: values.type,
            tone: "success",
        };
        setItems((current) =>
            editing
                ? current.map((old) => (old.id === item.id ? item : old))
                : [item, ...current],
        );
        setOpen(false);
        setEditing(null);
        setNotice(
            editing
                ? "Đã cập nhật danh mục trên giao diện."
                : "Đã tạo danh mục mới trên giao diện.",
        );
    }
    function remove() {
        if (!deleting) return;
        setItems((current) =>
            current.filter((item) => item.id !== deleting.id),
        );
        setNotice(`Đã xóa danh mục ${deleting.name}.`);
        setDeleting(null);
    }
    return (
        <>
            <PageHeader
                title="Quản lý danh mục"
                description="Phân loại sách và nội dung audio trong hệ thống"
                action={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setOpen(true);
                        }}
                    >
                        <FolderPlus className="h-4 w-4" />
                        Thêm danh mục
                    </Button>
                }
            />
            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <h2 className="font-bold">
                        Tất cả danh mục{" "}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                            {items.length}
                        </span>
                    </h2>
                    <SearchBox
                        placeholder="Tìm danh mục"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <div className="table-scroll">
                    <table className="admin-table w-full min-w-175 text-left">
                        <thead>
                            <tr>
                                <th className={tableHeadClass}>Tên danh mục</th>
                                <th className={tableHeadClass}>Số nội dung</th>
                                <th className={tableHeadClass}>Loại</th>
                                <th className={tableHeadClass}>Trạng thái</th>
                                <th className={tableHeadClass}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr
                                    className="border-t border-slate-100 dark:border-slate-800"
                                    key={item.id}
                                >
                                    <td
                                        className={`${tableCellClass} font-semibold`}
                                    >
                                        {item.name}
                                    </td>
                                    <td className={tableCellClass}>
                                        {item.count}
                                    </td>
                                    <td className={tableCellClass}>
                                        {item.type}
                                    </td>
                                    <td className={tableCellClass}>
                                        <Badge tone={item.tone}>
                                            Đang hoạt động
                                        </Badge>
                                    </td>
                                    <td
                                        className={`${tableCellClass} flex gap-2`}
                                    >
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
                                        <Button
                                            variant="ghost"
                                            className="px-2 text-rose-600"
                                            onClick={() => setDeleting(item)}
                                            aria-label={`Xóa ${item.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    page={1}
                    totalPages={Math.max(1, Math.ceil(filtered.length / 10))}
                />
            </TableCard>
            <EntityModal
                open={open}
                title={editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
                description="Dữ liệu đang được lưu tạm trên frontend."
                fields={[
                    {
                        key: "name",
                        label: "Tên danh mục",
                        placeholder: "Ví dụ: Cựu Ước",
                    },
                    {
                        key: "type",
                        label: "Loại danh mục",
                        placeholder: "Chọn loại danh mục",
                        options: [
                            {
                                label: "Nội dung Kinh Thánh",
                                value: "Nội dung Kinh Thánh",
                            },
                            { label: "Audio series", value: "Audio series" },
                            { label: "Suy ngẫm", value: "Suy ngẫm" },
                        ],
                    },
                    {
                        key: "count",
                        label: "Số nội dung",
                        type: "number",
                        placeholder: "0",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            name: editing.name,
                            type: editing.type,
                            count: editing.count,
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo danh mục"}
                onClose={() => setOpen(false)}
                onSubmit={save}
            />
            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting?.name ?? "danh mục này"}
                onClose={() => setDeleting(null)}
                onConfirm={remove}
            />
            {notice && (
                <FlashAlert message={notice} onClose={() => setNotice("")} />
            )}
        </>
    );
}
