import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) delete config.headers["Content-Type"];
    return config;
});

let refreshPromise: Promise<string | null> | null = null;
function clearAuth() {
    if (typeof window === "undefined") return;
    ["accessToken", "refreshToken", "tokenExpiry"].forEach((key) =>
        localStorage.removeItem(key),
    );
}

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const original = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;
        if (
            error.response?.status === 401 &&
            original &&
            !original._retry &&
            typeof window !== "undefined"
        ) {
            original._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                refreshPromise ??= axios
                    .post("/api/refresh", { refreshToken }, { timeout: 5000 })
                    .then(({ data }) => {
                        const body = data?.data ?? data;
                        if (!body?.accessToken)
                            throw new Error("Refresh token không hợp lệ");
                        localStorage.setItem("accessToken", body.accessToken);
                        if (body.refreshToken)
                            localStorage.setItem(
                                "refreshToken",
                                body.refreshToken,
                            );
                        localStorage.setItem(
                            "tokenExpiry",
                            String(Date.now() + 30 * 60 * 1000),
                        );
                        return body.accessToken;
                    })
                    .catch((refreshError) => {
                        clearAuth();
                        throw refreshError;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
                try {
                    const token = await refreshPromise;
                    if (token)
                        original.headers.Authorization = `Bearer ${token}`;
                    return apiClient(original);
                } catch {
                    return Promise.reject(error);
                }
            }
            clearAuth();
        }
        return Promise.reject(error.response?.data ?? error);
    },
);

export const api = {
    get: <T = unknown,>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config) as Promise<T>,
    post: <T = unknown,>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ) => apiClient.post<T>(url, data, config) as Promise<T>,
    put: <T = unknown,>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ) => apiClient.put<T>(url, data, config) as Promise<T>,
    patch: <T = unknown,>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ) => apiClient.patch<T>(url, data, config) as Promise<T>,
    delete: <T = unknown,>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config) as Promise<T>,
};
