import { api } from "@/lib/api-client";
export const categoryService = { list: () => api.get("/category"), create: (data: FormData | unknown) => api.post("/category/create", data), update: (id: string, data: FormData | unknown) => api.put(`/category/${id}`, data), remove: (id: string) => api.delete(`/category/${id}`), books: (id: string) => api.get(`/category/books/${id}`) };
