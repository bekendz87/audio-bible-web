import { api } from "@/lib/api-client";
export const authService = {
    login: (data: unknown) => api.post("/login", data),
    logout: (refreshToken: string) => api.post("/logout", { refreshToken }),
};
