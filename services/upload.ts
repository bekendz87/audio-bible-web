import { api } from "@/lib/api-client";

export const uploadService = {
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return api.post("/upload/images", formData);
    },

    uploadAudio: async (file: File, onProgress?: (e: any) => void) => {
        const formData = new FormData();
        formData.append("file", file);

        return await api.post("/upload/audio", formData, { onUploadProgress: onProgress, });
    },
};