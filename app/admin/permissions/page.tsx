"use client";

import { useState } from "react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import {
    Badge,
    Button,
    PageHeader,
    TableCard,
    tableCellClass,
    tableHeadClass,
} from "@/components/admin/ui";
import { ConfirmModal, EntityModal } from "@/components/admin/crud";
import { FlashAlert } from "@/components/admin/feedback";

type Role = {
    id: number;
    name: string;
    description: string;
    count: string;
    tone: "success" | "warning" | "neutral";
};
const initialRoles: Role[] = [
    {
        id: 1,
        name: "Super Admin",
        description: "Toàn quyền hệ thống",
        count: "24",
        tone: "success",
    },
    {
        id: 2,
        name: "Editor",
        description: "Quản lý nội dung",
        count: "16",
        tone: "success",
    },
    {
        id: 3,
        name: "Content Manager",
        description: "Sách và chương",
        count: "10",
        tone: "warning",
    },
    {
        id: 4,
        name: "Viewer",
        description: "Chỉ xem báo cáo",
        count: "4",
        tone: "neutral",
    },
];
const matrix = [
    ["Quản lý người dùng", "Toàn quyền", "Xem", "Không"],
    ["Quản lý nội dung", "Toàn quyền", "Toàn quyền", "Xem"],
    ["Xem báo cáo", "Toàn quyền", "Xem", "Xem"],
];

export default function PermissionsPage() {
    const [roles, setRoles] = useState(initialRoles);
    const [editing, setEditing] = useState<Role | null>(null);
    const [deleting, setDeleting] = useState<Role | null>(null);
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState("");
    function save(values: Record<string, string>) {
        const role: Role = {
            id: editing?.id ?? Date.now(),
            name: values.name,
            description: values.description,
            count: values.count || "0",
            tone: "success",
        };
        setRoles((current) =>
            editing
                ? current.map((old) => (old.id === role.id ? role : old))
                : [role, ...current],
        );
        setOpen(false);
        setEditing(null);
        setNotice(
            editing
                ? "Đã cập nhật vai trò trên giao diện."
                : "Đã tạo vai trò mới trên giao diện.",
        );
    }
    function remove() {
        if (!deleting) return;
        setRoles((current) =>
            current.filter((role) => role.id !== deleting.id),
        );
        setNotice(`Đã xóa vai trò ${deleting.name}.`);
        setDeleting(null);
    }
    return (
        <>
            <PageHeader
                title="Quản lý quyền"
                description="Thiết lập vai trò và quyền truy cập cho từng nhóm người dùng"
                action={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Tạo vai trò
                    </Button>
                }
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {roles.map((role) => (
                    <div className="glass-panel rounded-2xl p-5" key={role.id}>
                        <div className="flex items-start justify-between">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15">
                                <KeyRound className="h-5 w-5" />
                            </span>
                            <Badge tone={role.tone}>
                                {role.tone === "success"
                                    ? "Đang dùng"
                                    : role.tone === "warning"
                                      ? "Giới hạn"
                                      : "Cơ bản"}
                            </Badge>
                        </div>
                        <h2 className="mt-5 font-bold">{role.name}</h2>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {role.description}
                        </p>
                        <p className="mt-4 text-sm text-slate-600">
                            <strong className="text-lg text-slate-950 dark:text-white">
                                {role.count}
                            </strong>{" "}
                            quyền được cấp
                        </p>
                        <div className="mt-4 flex gap-1 border-t border-slate-200/50 pt-3 dark:border-slate-700/50">
                            <Button
                                variant="ghost"
                                className="px-2"
                                onClick={() => {
                                    setEditing(role);
                                    setOpen(true);
                                }}
                                aria-label={`Sửa ${role.name}`}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="px-2 text-rose-600"
                                onClick={() => setDeleting(role)}
                                aria-label={`Xóa ${role.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <TableCard>
                <div className="border-b border-slate-100 p-5 dark:border-slate-800">
                    <h2 className="font-bold">Ma trận quyền truy cập</h2>
                </div>
                <div className="table-scroll">
                    <table className="admin-table w-full min-w-160 text-left">
                        <thead>
                            <tr>
                                <th className={tableHeadClass}>Tính năng</th>
                                <th className={tableHeadClass}>Super Admin</th>
                                <th className={tableHeadClass}>Editor</th>
                                <th className={tableHeadClass}>Viewer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map(([feature, admin, editor, viewer]) => (
                                <tr
                                    className="border-t border-slate-100 dark:border-slate-800"
                                    key={feature}
                                >
                                    <td
                                        className={`${tableCellClass} font-semibold`}
                                    >
                                        {feature}
                                    </td>
                                    <td className={tableCellClass}>{admin}</td>
                                    <td className={tableCellClass}>{editor}</td>
                                    <td className={tableCellClass}>{viewer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableCard>
            <EntityModal
                open={open}
                title={editing ? "Chỉnh sửa vai trò" : "Tạo vai trò"}
                description="Vai trò và quyền đang được mô phỏng trên frontend."
                fields={[
                    {
                        key: "name",
                        label: "Tên vai trò",
                        placeholder: "Editor",
                    },
                    {
                        key: "description",
                        label: "Mô tả",
                        placeholder: "Quản lý nội dung",
                    },
                    {
                        key: "count",
                        label: "Số quyền",
                        type: "number",
                        placeholder: "0",
                    },
                ]}
                initialValues={
                    editing
                        ? {
                              name: editing.name,
                              description: editing.description,
                              count: editing.count,
                          }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo vai trò"}
                onClose={() => setOpen(false)}
                onSubmit={save}
            />
            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting?.name ?? "vai trò này"}
                onClose={() => setDeleting(null)}
                onConfirm={remove}
            />
            {notice && (
                <FlashAlert message={notice} onClose={() => setNotice("")} />
            )}
        </>
    );
}
