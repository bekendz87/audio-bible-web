"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button, Input, Select } from "@/components/admin/ui";
import { Modal, FlashAlert } from "@/components/admin/feedback";
import { uploadService } from "@/services/upload";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL_IMAGE || "";

type Field = {
    key: string;
    label: string;
    placeholder?: string;
    type?: string;
    accept?: string;
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
    initialValues?: Record<string, any>;
    submitLabel?: string;
    onClose: () => void;
    onSubmit: (values: Record<string, any>) => void;
}) {
    const [values, setValues] = useState<Record<string, any>>(
        initialValues ?? {},
    );
    const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
    const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>({});

    const [notice, setNotice] = useState("");
    const [tone, setTone] = useState<"success" | "error" | "warning">("success");

    useEffect(() => {
        if (open) {
            setValues(initialValues ?? {});
            setFilePreviews({});
            setUploadingKeys({});
            setNotice("");
        }
    }, [open, initialValues]);

    async function handleFileChange(key: string, file: File | null) {
        if (!file) {
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setFilePreviews((prev) => ({
            ...prev,
            [key]: localPreview,
        }));

        setUploadingKeys((prev) => ({ ...prev, [key]: true }));

        try {
            const res: any = await uploadService.uploadImage(file);

            const uploadedPath = res?.path || res?.url || res?.data?.path || (typeof res === "string" ? res : "");

            if (uploadedPath) {
                setValues((current) => ({
                    ...current,
                    [key]: uploadedPath,
                }));


                const fullImageUrl = uploadedPath.startsWith("http") ? uploadedPath : `${IMAGE_BASE_URL}${uploadedPath}`;

                setFilePreviews((prev) => ({
                    ...prev,
                    [key]: fullImageUrl,
                }));

                setNotice("Tải ảnh lên thành công!");
                setTone("success");
            }
        } catch (error: any) {
            console.error("Lỗi upload ảnh:", error);
            setNotice(error?.message || "Có lỗi xảy ra khi tải ảnh lên server!");
            setTone("error");
        } finally {
            setUploadingKeys((prev) => ({ ...prev, [key]: false }));
        }
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(values);
    }

    const getPreviewUrl = (rawUrl?: string) => {
        if (!rawUrl) {
            return "";
        }
        
        if (rawUrl.startsWith("blob:") || rawUrl.startsWith("http")) {
            return rawUrl;
        }
        return `${IMAGE_BASE_URL}${rawUrl}`;
    };

    return (
        <>
            <Modal
                open={open}
                title={title}
                description={description}
                onClose={onClose}
            >
                <form onSubmit={submit} className="space-y-4">
                    {fields.map((field) => {
                        if (field.type === "file") {
                            const isUploading = uploadingKeys[field.key];
                            const rawPreview =
                                filePreviews[field.key] ||
                                values[field.key] ||
                                values.artworkUrl ||
                                values.coverUrl ||
                                "";
                            const currentPreview = getPreviewUrl(rawPreview);

                            return (
                                <div key={field.key} className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {field.label}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex h-16 w-12 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                                            {isUploading ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                                            ) : currentPreview ? (
                                                <img
                                                    src={currentPreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                            )}
                                        </div>

                                        <label
                                            className={`flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${isUploading ? "pointer-events-none opacity-50" : ""
                                                }`}
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span>{isUploading ? "Đang tải lên..." : "Chọn tệp..."}</span>
                                            <input
                                                type="file"
                                                accept={field.accept || "image/*"}
                                                disabled={isUploading}
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleFileChange(
                                                        field.key,
                                                        e.target.files?.[0] || null
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>
                            );
                        }

                        if (field.options) {
                            return (
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
                            );
                        }

                        return (
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
                        );
                    })}

                    <div className="flex justify-end gap-3 border-t border-slate-200/60 pt-5 dark:border-slate-700/60">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={Object.values(uploadingKeys).some(Boolean)}
                        >
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </Modal>

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
                        {title}
                    </Button>
                </>
            }
        >
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50/75 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                    Bạn có chắc thực hiện thao tác <strong>{itemName}</strong>? Thao tác
                    này sẽ không thể hoàn tác.
                </p>
            </div>
        </Modal>
    );
}