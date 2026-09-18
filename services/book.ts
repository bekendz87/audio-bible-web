import { api } from "@/lib/api-client";
export const bookService = {
    list: (params?: Record<string, unknown>) => api.get("/book", { params }),
    create: (data: FormData | unknown) => api.post("/book/create", data),
    detail: (id: string) => api.get(`/book/${id}`),
    update: (id: Number, data: FormData | unknown) => api.put(`/book/${id}`, data),
    remove: (id: Number) => api.delete(`/book/${id}`),
};
