import { api } from "@/lib/api-client";

export const uploadService = {
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return api.post("/upload/images", formData);
    },
};