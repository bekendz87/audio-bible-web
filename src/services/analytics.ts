import { api } from "@/lib/api-client";
export const analyticsService = { overview: () => api.get("/analytics") };
