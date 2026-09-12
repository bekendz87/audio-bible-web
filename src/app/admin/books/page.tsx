"use client";

import { useState } from "react";
import { BookPlus, Pencil, Trash2 } from "lucide-react";
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

type Book = {
    id: number;
    name: string;
    category: string;
    chapters: string;
    status: string;
    tone: "success" | "warning" | "neutral";
};
const initialBooks: Book[] = [
    {
        id: 1,
        name: "Sáng Thế Ký",
        category: "Cựu Ước",
        chapters: "50",
        status: "Đã xuất bản",
        tone: "success",
    },
    {
        id: 2,
        name: "Thi Thiên",
        category: "Cựu Ước",
        chapters: "150",
        status: "Đã xuất bản",
        tone: "success",
    },
    {
        id: 3,
        name: "Phúc Âm Giăng",
        category: "Tân Ước",
        chapters: "21",
        status: "Đang cập nhật",
        tone: "warning",
    },
    {
        id: 4,
        name: "Rô-ma",
        category: "Tân Ước",
        chapters: "16",
        status: "Bản nháp",
        tone: "neutral",
    },
];

export default function BooksPage() {
    const [items, setItems] = useState(initialBooks);
    const [editing, setEditing] = useState<Book | null>(null);
    const [deleting, setDeleting] = useState<Book | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("");
    const filtered = items.filter((item) =>
        `${item.name} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
    );
    function save(values: Record<string, string>) {
        const item: Book = {
            id: editing?.id ?? Date.now(),
            name: values.name,
            category: values.category,
            chapters: values.chapters || "0",
            status: editing?.status ?? "Bản nháp",
            tone: editing?.tone ?? "neutral",
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
                ? "Đã cập nhật sách trên giao diện."
                : "Đã tạo sách mới trên giao diện. Trạng thái sẽ do hệ thống cập nhật.",
        );
    }
    function remove() {
        if (!deleting) return;
        setItems((current) =>
            current.filter((item) => item.id !== deleting.id),
        );
        setNotice(`Đã xóa sách ${deleting.name}.`);
        setDeleting(null);
    }
    return (
        <>
            <PageHeader
                title="Quản lý sách"
                description="Quản lý thông tin sách, bản dịch và trạng thái xuất bản"
                action={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setOpen(true);
                        }}
                    >
                        <BookPlus className="h-4 w-4" />
                        Thêm sách
                    </Button>
                }
            />
            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <h2 className="font-bold">
                        Danh sách sách{" "}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                            {items.length}
                        </span>
                    </h2>
                    <SearchBox
                        placeholder="Tìm tên sách"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <div className="table-scroll">
                    <table className="admin-table w-full min-w-175 text-left">
                        <thead>
                            <tr>
                                <th className={tableHeadClass}>Tên sách</th>
                                <th className={tableHeadClass}>Danh mục</th>
                                <th className={tableHeadClass}>Số chương</th>
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
                                        {item.category}
                                    </td>
                                    <td className={tableCellClass}>
                                        {item.chapters}
                                    </td>
                                    <td className={tableCellClass}>
                                        <Badge tone={item.tone}>
                                            {item.status}
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
                title={editing ? "Chỉnh sửa sách" : "Thêm sách"}
                description="Dữ liệu đang được lưu tạm trên frontend. Trạng thái do hệ thống tự cập nhật."
                fields={[
                    {
                        key: "name",
                        label: "Tên sách",
                        placeholder: "Ví dụ: Sáng Thế Ký",
                    },
                    {
                        key: "category",
                        label: "Danh mục",
                        placeholder: "Chọn danh mục",
                        options: [
                            { label: "Cựu Ước", value: "Cựu Ước" },
                            { label: "Tân Ước", value: "Tân Ước" },
                        ],
                    },
                    {
                        key: "chapters",
                        label: "Số chương",
                        type: "number",
                        placeholder: "0",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            name: editing.name,
                            category: editing.category,
                            chapters: editing.chapters,
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo sách"}
                onClose={() => setOpen(false)}
                onSubmit={save}
            />
            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting?.name ?? "sách này"}
                onClose={() => setDeleting(null)}
                onConfirm={remove}
            />
            {notice && (
                <FlashAlert message={notice} onClose={() => setNotice("")} />
            )}
        </>
    );
}
