"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { permissionService } from "@/services/permissions";
import { findApiCodeByPath } from "@/lib/permission-resolver";
import Cookies from "js-cookie";

type Manifest = {
    module: string;
    features: {
        apis: { method: string; clientPath: string; code: string }[];
    }[];
}[];

type PermissionContextValue = {
    loading: boolean;
    userPermissions: string[];
    scannedModules: Manifest;
    canAccess: (method: string, path: string) => boolean;
    refetchPermissions: () => Promise<void>;
};

const PermissionContext = createContext<PermissionContextValue>({
    loading: true,
    userPermissions: [],
    scannedModules: [],
    canAccess: () => true,
    refetchPermissions: async () => undefined,
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [scannedModules, setScannedModules] = useState<Manifest>([]);

    const load = async () => {
        setLoading(true);
        try {
            const scan = await api.get<Manifest>("/permissions/scan");
            setScannedModules(
                Array.isArray(scan) ? scan : ((scan as { data?: Manifest })?.data ?? [])
            );

            if (typeof window !== "undefined" && Cookies.get("accessToken")) {
                const result = await permissionService.byUser();
                const permissions =
                    (result as { data?: { code?: string }[] })?.data ??
                    (Array.isArray(result) ? (result as { code?: string }[]) : []);

                setUserPermissions(
                    permissions
                        .map((permission) => permission.code)
                        .filter((code): code is string => Boolean(code))
                );
            }
        } catch (err) {
            console.error("Lỗi tải danh sách quyền:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const value = useMemo(
        () => ({
            loading,
            userPermissions,
            scannedModules,
            refetchPermissions: load,
            canAccess: (method: string, clientPath: string) => {

                const normalizedPath = clientPath.startsWith("/admin") ? clientPath.replace(/^\/admin/, "") || "/" : clientPath;

                const code = findApiCodeByPath(scannedModules, method, normalizedPath);
                if (!code) {
                    return true;
                }

                return userPermissions.includes(code);
            },
        }),
        [loading, userPermissions, scannedModules]
    );

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export const useAutoPermissions = () => useContext(PermissionContext);