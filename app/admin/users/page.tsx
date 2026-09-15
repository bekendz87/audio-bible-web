"use client";

import { useState } from "react";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
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

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: "Hoạt động" | "Tạm khóa";
};
const initialUsers: User[] = [
    {
        id: 1,
        name: "Nguyễn Minh Anh",
        email: "minhanh@gmail.com",
        role: "Admin",
        status: "Hoạt động",
    },
    {
        id: 2,
        name: "Trần Hoàng Nam",
        email: "nam.tran@gmail.com",
        role: "Editor",
        status: "Hoạt động",
    },
    {
        id: 3,
        name: "Lê Thu Hà",
        email: "leha@gmail.com",
        role: "Viewer",
        status: "Tạm khóa",
    },
    {
        id: 4,
        name: "Phạm Đức Long",
        email: "duc.long@gmail.com",
        role: "Editor",
        status: "Hoạt động",
    },
];

export default function UsersPage() {
    const [users, setUsers] = useState(initialUsers);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState("");
    const filtered = users.filter((user) =>
        `${user.name} ${user.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
    );
    function save(values: Record<string, string>) {
        const user: User = {
            id: editing?.id ?? Date.now(),
            name: values.name,
            email: values.email,
            role: values.role,
            status: "Hoạt động",
        };
        setUsers((current) =>
            editing
                ? current.map((item) =>
                    item.id === editing.id ? { ...item, ...user } : item,
                )
                : [user, ...current],
        );
        setOpen(false);
        setEditing(null);
        setNotice(
            editing
                ? "Đã cập nhật người dùng trên giao diện."
                : "Đã tạo người dùng mới trên giao diện.",
        );
    }
    function remove() {
        if (!deleting) return;
        setUsers((current) =>
            current.filter((item) => item.id !== deleting.id),
        );
        setNotice(`Đã xóa ${deleting.name} trên giao diện.`);
        setDeleting(null);
    }
    return (
        <>
            <PageHeader
                title="Quản lý người dùng"
                description="Quản lý tài khoản và trạng thái truy cập hệ thống"
                action={
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setOpen(true);
                        }}
                    >
                        <UserPlus className="h-4 w-4" />
                        Thêm người dùng
                    </Button>
                }
            />
            <TableCard>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row">
                    <div>
                        <h2 className="font-bold">
                            Danh sách người dùng{" "}
                            <span className="ml-1 text-sm font-normal text-slate-500">
                                {users.length}
                            </span>
                        </h2>
                    </div>
                    <SearchBox
                        placeholder="Tìm theo tên hoặc email"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <div className="table-scroll">
                    <table className="admin-table w-full min-w-175 text-left">
                        <thead>
                            <tr>
                                <th className={tableHeadClass}>Người dùng</th>
                                <th className={tableHeadClass}>Vai trò</th>
                                <th className={tableHeadClass}>Trạng thái</th>
                                <th className={tableHeadClass}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user) => (
                                <tr
                                    className="border-t border-slate-100 dark:border-slate-800"
                                    key={user.id}
                                >
                                    <td className={tableCellClass}>
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15">
                                                {user.name
                                                    .split(" ")
                                                    .slice(-2)
                                                    .map((x) => x[0])
                                                    .join("")}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={tableCellClass}>
                                        <Badge>{user.role}</Badge>
                                    </td>
                                    <td className={tableCellClass}>
                                        <Badge
                                            tone={
                                                user.status === "Hoạt động"
                                                    ? "success"
                                                    : "danger"
                                            }
                                        >
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td
                                        className={`${tableCellClass} flex gap-2`}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="px-2"
                                            onClick={() => {
                                                setEditing(user);
                                                setOpen(true);
                                            }}
                                            aria-label={`Sửa ${user.name}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="px-2 text-rose-600"
                                            onClick={() => setDeleting(user)}
                                            aria-label={`Xóa ${user.name}`}
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
                title={editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                description="Thông tin chỉ được lưu tạm trên frontend."
                fields={[
                    {
                        key: "name",
                        label: "Họ và tên",
                        placeholder: "Nguyễn Văn A",
                    },
                    {
                        key: "email",
                        label: "Email",
                        type: "email",
                        placeholder: "user@example.com",
                    },
                    {
                        key: "role",
                        label: "Vai trò",
                        placeholder: "Chọn vai trò",
                        options: [
                            { label: "Admin", value: "Admin" },
                            { label: "Editor", value: "Editor" },
                            { label: "Viewer", value: "Viewer" },
                        ],
                    },
                ]}
                initialValues={
                    editing
                        ? {
                            name: editing.name,
                            email: editing.email,
                            role: editing.role,
                        }
                        : undefined
                }
                submitLabel={editing ? "Lưu thay đổi" : "Tạo người dùng"}
                onClose={() => setOpen(false)}
                onSubmit={save}
            />
            <ConfirmModal
                open={Boolean(deleting)}
                itemName={deleting?.name ?? "người dùng này"}
                onClose={() => setDeleting(null)}
                onConfirm={remove}
            />
            {notice && (
                <FlashAlert message={notice} onClose={() => setNotice("")} />
            )}
        </>
    );
}
