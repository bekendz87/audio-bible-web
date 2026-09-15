import { SIDEBAR_MODULE_MAP } from "@/types/sidebar_module_map";

type PermissionManifest = {
    module: string;
    features: {
        apis: { method: string; clientPath: string; code: string }[];
    }[];
}[];

export function findApiCodeByPath(
    manifest: PermissionManifest,
    method: string,
    clientPath: string,
) {
    const cleanPath = clientPath.toLowerCase().replace(/\/$/, "");
    for (const manifestModule of manifest ?? [])
        for (const feature of manifestModule.features ?? [])
            for (const api of feature.apis ?? []) {
                const pattern = api.clientPath
                    .toLowerCase()
                    .replace(/\/$/, "")
                    .replace(/:[^/]+/g, "[^/]+");

                if (api.method === method.toUpperCase() && new RegExp(`^${pattern}$`).test(cleanPath)) {
                    return api.code;
                }

            }
    const sidebarModule = SIDEBAR_MODULE_MAP[cleanPath];
    return sidebarModule && method.toUpperCase() === "GET" ? `SIDEBAR_MENU_MODULE_${sidebarModule}` : null;
}
