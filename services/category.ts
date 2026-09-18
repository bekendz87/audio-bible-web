import { api } from "@/lib/api-client";
export const categoryService = {
    list: (params?: Record<string, unknown>) => api.get("/category", { params }),
    create: (data: FormData | unknown) => api.post("/category/create", data),
    update: (id: Number, data: FormData | unknown) => api.put(`/category/${id}`, data),
    remove: (id: Number) => api.delete(`/category/${id}`),
    books: (id: Number) => api.get(`/category/books/${id}`),
};
