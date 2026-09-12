import { api } from "@/lib/api-client";

export const trackService = {
  upload: (data: FormData) => api.post("/track/upload", data),
};
