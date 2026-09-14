"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { permissionService } from "@/services/permissions";
import { findApiCodeByPath } from "@/lib/permission-resolver";

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

export function PermissionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [scannedModules, setScannedModules] = useState<Manifest>([]);

    const load = async () => {
        setLoading(true);
        try {
            const scan = await api.get<Manifest>("/permissions/scan");
            setScannedModules(
                Array.isArray(scan)
                    ? scan
                    : ((scan as { data?: Manifest })?.data ?? []),
            );
            if (
                typeof window !== "undefined" &&
                localStorage.getItem("accessToken")
            ) {
                const result = await permissionService.byUser();
                const permissions =
                    (result as { data?: { code?: string }[] })?.data ??
                    (Array.isArray(result)
                        ? (result as { code?: string }[])
                        : []);
                setUserPermissions(
                    permissions
                        .map((permission) => permission.code)
                        .filter((code): code is string => Boolean(code)),
                );
            }
        } catch {
      
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);
    const value = useMemo(
        () => ({
            loading,
            userPermissions,
            scannedModules,
            refetchPermissions: load,
            canAccess: (method: string, clientPath: string) => {
                if (!userPermissions.length) return true;
                const code = findApiCodeByPath(
                    scannedModules,
                    method,
                    clientPath,
                );
                return Boolean(code && userPermissions.includes(code));
            },
        }),
        [loading, userPermissions, scannedModules],
    );
    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export const useAutoPermissions = () => useContext(PermissionContext);
