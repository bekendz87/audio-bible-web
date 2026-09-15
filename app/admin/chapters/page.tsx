"use client";

import { useState } from "react";
import { FilePlus2, Pencil, Trash2 } from "lucide-react";
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

type Chapter = {
    id: number;
    book: string;
    chapter: string;
    duration: string;
    status: string;
    tone: "success" | "warning" | "neutral";
};
const initialChapters: Chapter[] = [
    {
        id: 1,
        book: "Sáng Thế Ký",
        chapter: "Chương 01",
        duration: "23:18",
        status: "Đã có audio",
        tone: "success",
    },
    {
        id: 2,
        book: "Sáng Thế Ký",
        chapter: "Chương 02",
        duration: "22:41",
        status: "Đã có audio",
        tone: "success",
    },
    {
        id: 3,
        book: "Phúc Âm Giăng",
        chapter: "Chương 03",
        duration: "18:52",
        status: "Chờ upload",
        tone: "warning",
    },
    {
        id: 4,
        book: "Rô-ma",
        chapter: "Chương 01",
        duration: "—",
        status: "Bản nháp",
        tone: "neutral",
    },
];

export default function ChaptersPage() {
    const [items, setItems] = useState(initialChapters);
    const [editing, setEditing] = useState<Chapter | null>(null);
    const [deleting, setDeleting] = useState<Chapter | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("");
    const filtered = items.filter((item) =>
        `${item.book} ${item.chapter}`
            .toLowerCase()
            .includes(query.toLowerCase()),
    );
    function save(values: Record<string, string>) {
        const item: Chapter = {
            id: editing?.id ?? Date.now(),
            book: values.book,
            chapter: values.chapter,
            duration: values.duration || "—",
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
                ? "Đã cập nhật chương trên giao diện."
                : "Đã tạo chương mới trên giao diện. Trạng thái audio sẽ do hệ thống tự cập nhật.",
        );
    }
    function remove() {
        if (!deleting) return;
        setItems((current) =>
            current.filter((item) => item.id !== deleting.id),
        );
        setNotice(`Đã xóa ${deleting.chapter} của ${deleting.book}.`);
        setDeleting(null);
    }
    return (
        <>
            <PageHeader
                title="Quản lý chương"
                description="Quản lý nội dung, audio và bản dịch theo từng chương"
                action={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setOpen(true);
                        }}
                    >
                        <FilePlus2 className="h-4 w-4" />
                        Thêm chương
                    </Button>
                }
            />
            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <h2 className="font-bold">
                        Danh sách chương{" "}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                            {items.length}
                        </span>
                    </h2>
                    <SearchBox
                        placeholder="Tìm chương hoặc sách"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <div className="table-scroll">
                    <table className="admin-table w-full min-w-175 text-left">
                        <thead>
                            <tr>
                                <th className={tableHeadClass}>Sách</th>
                                <th className={tableHeadClass}>Chương</th>
                                <th className={tableHeadClass}>Thời lượng</th>
                                <th className={tableHeadClass}>
                                    Trạng thái audio
                                </th>
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
                                        {item.book}
                                    </td>
                                    <td className={tableCellClass}>
                                        {item.chapter}
                                    </td>
                                    <td className={tableCellClass}>
                                        {item.duration}
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
                                            aria-label={`Sửa ${item.chapter}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="px-2 text-rose-600"
                                            onClick={() => setDeleting(item)}
                                            aria-label={`Xóa ${item.chapter}`}
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
                title={editing ? "Chỉnh sửa chương" : "Thêm chương"}
                description="Dữ liệu đang được lưu tạm trên frontend. Trạng thái audio do hệ thống tự cập nhật."
                fields={[
                    {
                        key: "book",
                        label: "Tên sách",
                        placeholder: "Chọn sách",
                        options: [
                            { label: "Sáng Thế Ký", value: "Sáng Thế Ký" },
                            { label: "Phúc Âm Giăng", value: "Phúc Âm Giăng" },
                            { label: "Rô-ma", value: "Rô-ma" },
                        ],
                    },
                    {
                        key: "chapter",
                        label: "Tên chương",
                        placeholder: "Chương 01",
                    },
                    {
                        key: "duration",
                        label: "Thời lượng",
                        placeholder: "23:18",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            book: editing.book,
                            chapter: editing.chapter,
                            duration: editing.duration,
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo chương"}
                onClose={() => setOpen(false)}
                onSubmit={save}
            />
            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting?.chapter ?? "chương này"}
                onClose={() => setDeleting(null)}
                onConfirm={remove}
            />
            {notice && (
                <FlashAlert message={notice} onClose={() => setNotice("")} />
            )}
        </>
    );
}
