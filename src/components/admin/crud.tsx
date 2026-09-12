"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Input, Select } from "@/components/admin/ui";
import { Modal } from "@/components/admin/feedback";

type Field = {
    key: string;
    label: string;
    placeholder?: string;
    type?: string;
    options?: { label: string; value: string }[];
};

export function EntityModal({
    open,
    title,
    description,
    fields,
    initialValues,
    submitLabel = "Lưu thông tin",
    onClose,
    onSubmit,
}: {
    open: boolean;
    title: string;
    description?: string;
    fields: Field[];
    initialValues?: Record<string, string>;
    submitLabel?: string;
    onClose: () => void;
    onSubmit: (values: Record<string, string>) => void;
}) {
    const [values, setValues] = useState<Record<string, string>>(
        initialValues ?? {},
    );
    useEffect(() => {
        if (open) {
            setValues(initialValues ?? {});
        }
    }, [open, initialValues]);
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(values);
    }
    return (
        <Modal
            open={open}
            title={title}
            description={description}
            onClose={onClose}
        >
            <form onSubmit={submit} className="space-y-4">
                {fields.map((field) =>
                    field.options ? (
                        <Select
                            key={field.key}
                            label={field.label}
                            options={field.options}
                            value={values[field.key] ?? ""}
                            placeholder={field.placeholder}
                            onChange={(value) =>
                                setValues((current) => ({
                                    ...current,
                                    [field.key]: value,
                                }))
                            }
                        />
                    ) : (
                        <Input
                            key={field.key}
                            label={field.label}
                            type={field.type ?? "text"}
                            placeholder={field.placeholder}
                            required
                            value={values[field.key] ?? ""}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    [field.key]: event.target.value,
                                }))
                            }
                        />
                    ),
                )}
                <div className="flex justify-end gap-3 border-t border-slate-200/60 pt-5 dark:border-slate-700/60">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button type="submit">{submitLabel}</Button>
                </div>
            </form>
        </Modal>
    );
}

export function ConfirmModal({
    open,
    title = "Xác nhận xóa",
    itemName,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title?: string;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={onClose}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={onConfirm}>
                        Xóa dữ liệu
                    </Button>
                </>
            }
        >
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50/75 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                    Bạn có chắc muốn xóa <strong>{itemName}</strong>? Thao tác
                    này chỉ mô phỏng trên giao diện.
                </p>
            </div>
        </Modal>
    );
}
