import { api } from "@/lib/api-client";

export const chapterService = {
    list: (params?: Record<string, unknown>) => api.get("/chapters", { params }),
    byBook: (id: number) => api.get(`/chapters/${id}`),
    create: (data: unknown) => api.post("/chapters/created", data),
    update: (id: number, data: unknown) => api.put(`/chapters/updated/${id}`, data),
    remove: (id: number) => api.delete(`/chapters/delete/${id}`),
    listByBookWithAudio: (params?: Record<string, unknown>) => api.get(`/chapters/book/have-audio`, { params })
};
