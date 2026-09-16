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
    const upperMethod = method.toUpperCase();

    const normalizedPath = cleanPath.endsWith("s") ? cleanPath.slice(0, -1) : cleanPath;

    for (const manifestModule of manifest ?? []) {
        for (const feature of manifestModule.features ?? []) {
            for (const api of feature.apis ?? []) {
                const apiPath = (api.clientPath || "").toLowerCase().replace(/\/$/, "");
                const apiPathNormalized = apiPath.endsWith("s") ? apiPath.slice(0, -1) : apiPath;

                const pattern = apiPathNormalized.replace(/:[^/]+/g, "[^/]+");

                if (
                    api.method?.toUpperCase() === upperMethod &&
                    (new RegExp(`^${pattern}$`).test(cleanPath) || new RegExp(`^${pattern}$`).test(normalizedPath))
                ) {
                    return api.code;
                }
            }
        }
    }

    const targetModule = SIDEBAR_MODULE_MAP[cleanPath] || SIDEBAR_MODULE_MAP[normalizedPath];
    if (targetModule && upperMethod === "GET") {
        for (const manifestModule of manifest ?? []) {
            if (manifestModule.module === targetModule) {
                for (const feature of manifestModule.features ?? []) {
                    for (const api of feature.apis ?? []) {
                        if (api.method?.toUpperCase() === "GET") {
                            return api.code;
                        }
                    }
                }
            }
        }
        return `SIDEBAR_MENU_MODULE_${targetModule}`;
    }

    return null;
}