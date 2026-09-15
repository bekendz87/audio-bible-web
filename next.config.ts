import type { NextConfig } from "next";
import { runAutoScan } from "@/lib/api-scanner";

const backendUrl = process.env.BACKEND_API_URL;
runAutoScan();

const nextConfig: NextConfig = {
    async rewrites() {
        if (!backendUrl) {
            return [];
        }
        const be = backendUrl.replace(/\/$/, "");
        const routes: [string, string][] = [
            ["/api/users/detail-info", "/users/info"],
            ["/api/book", "/admin/books"],
            ["/api/book/create", "/admin/books"],
            ["/api/track/upload", "/tracks/upload"],
            ["/api/narrator", "/narrators/all"],
            ["/api/author", "/authors/all"],
            ["/api/analytics", "/analytics/overview"],
            ["/api/login", "/auth/login"],
            ["/api/logout", "/auth/logout"],
            ["/api/refresh", "/auth/refresh"],
            ["/api/authors", "/admin/authors"],
            ["/api/category", "/admin/categories"],
            [
                "/api/refresh-token/:resource/:id/:action",
                "/admin/:resource/:id/:action",
            ],
            ["/api/chapters/:id", "/admin/chapters?bookId=:id"],
            ["/api/book/:id", "/admin/books/:id"],
            ["/api/category/create", "/admin/categories"],
            ["/api/category/:id", "/admin/categories/:id"],
            ["/api/chapters", "/admin/chapters"],
            ["/api/chapters/updated/:id", "/admin/chapters/:id"],
            ["/api/chapters/delete/:id", "/admin/chapters/:id"],
            ["/api/storage/upload-document", "/admin/storage/upload-document"],
            [
                "/api/storage/history-document",
                "/admin/storage/history-documents",
            ],
            ["/api/storage/history-voices", "/admin/storage/history-voices"],
            ["/api/storage/auto-save", "/admin/storage/auto-save-draft"],
            [
                "/api/storage/detail-document/:id",
                "/admin/storage/history-documents/detail?fileName=:id",
            ],
            ["/api/storage/create-txt", "/admin/storage/create-temp-txt"],
            [
                "/api/storage/remove-txt/:fileName",
                "/admin/storage/temp-texts/:fileName",
            ],
            [
                "/api/storage/remove-voice/:fileName",
                "/admin/storage/voice-history/:fileName",
            ],
            [
                "/api/storage/stream-voice/:fileName",
                "/admin/chapters/temp-audio/:fileName",
            ],
            ["/api/storage/list-voices", "/admin/chapters/list-voices"],
            [
                "/api/convert-text-to-audio",
                "/admin/chapters/convert-text-to-audio",
            ],
            ["/api/confirm-audio", "/admin/chapters"],
            ["/api/auth/me", "/log/logs?size=1"],
            ["/api/users", "/admin/users/client"],
            ["/api/users/admin", "/admin/users/admin"],
            ["/api/users/role/list", "/admin/users/role/list"],
            ["/api/permission/add-role", "/admin/users/role"],
            [
                "/api/permission/code/:code",
                "/admin/users/role/find-code?code=:code",
            ],
            ["/api/permission/role", "/auth/role"],
            ["/api/permission/remove", "/admin/users/role/remove"],
            [
                "/api/permission/module/:module",
                "/admin/users/role/find-module?moduleName=:module",
            ],
            ["/api/users/create", "/admin/users"],
            ["/api/users/:id", "/users/update/:id"],
            ["/api/logs", "/log/logs"],
            ["/api/logs/:id", "/log/logs/:id"],
            ["/api/logs/all", "/log/logs/all"],
            ["/api/authors/update/:id", "/admin/authors/:id"],
            ["/api/authors/delete/:id", "/admin/authors/:id"],
            [
                "/api/category/books/:id",
                "/admin/categories/get-book-with-categories/:id",
            ],
            ["/api/home-sections", "/admin/home-sections"],
            ["/api/home-sections/create-items", "/admin/home-sections-items"],
            [
                "/api/home-sections/remove-items/:id",
                "/admin/home-sections-items/:id",
            ],
            ["/api/home-sections/:id", "/admin/home-sections/:id"],
            [
                "/api/home-sections/remove-section/:id",
                "/admin/home-sections/:id",
            ],
            [
                "/api/home-sections/reorder/:id",
                "/admin/home-sections/reorder/:id",
            ],
            ["/api/system-features", "/admin/feature"],
            ["/api/system-features/update/:id", "/admin/feature/:id"],
            ["/api/system-features/delete/:id", "/admin/feature/:id"],
            ["/api/system-features/create", "/admin/feature"],
            ["/api/subscription-plans/active", "/admin/sub/active"],
            ["/api/subscription-plans/create", "/admin/sub"],
            ["/api/subscription-plans/update/:id", "/admin/sub/:id"],
            ["/api/reviews/get-all", "/admin/reviews"],
            ["/api/reviews/:id/approve", "/admin/reviews/:id/confirm"],
            ["/api/reviews/:id/reject", "/admin/reviews/:id"],
            ["/api/reviews/config-auto-review", "/app/config/update"],
            ["/api/reviews/get-config", "/app/config/status"],
            ["/api/bad-words", "/admin/books/bad-words/list"],
        ];
        return routes.map(([source, destination]) => ({
            source,
            destination: `${be}${destination}`,
        }));
    },
    experimental: { workerThreads: false, cpus: 1, webpackBuildWorker: false },
    productionBrowserSourceMaps: false,
    webpack: (config, { dev }) => {
        if (dev) {
            config.devtool = false;
        }
        return config;
    },
    turbopack: {},
};

export default nextConfig;
