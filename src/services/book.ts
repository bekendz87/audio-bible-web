import { api } from "@/lib/api-client";
export const bookService = { list: (params?: Record<string, unknown>) => api.get("/book", { params }), create: (data: FormData | unknown) => api.post("/book/create", data), detail: (id: string) => api.get(`/book/${id}`), update: (id: string, data: FormData | unknown) => api.put(`/book/${id}`, data), remove: (id: string) => api.delete(`/book/${id}`) };
