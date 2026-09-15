export type UserRole = "USER" | "ADMIN" | "CONTENT_CREATOR" | string;

export interface RoleConfig {
    label: string;
    tone: "neutral" | "success" | "warning" | "error" | "info";
    colorClass: string;
}

export const ROLE_MAP: Record<string, RoleConfig> = {
    ADMIN: {
        label: "Quản trị viên",
        tone: "error",
        colorClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-800",
    },
    CONTENT_CREATOR: {
        label: "Biên tập viên",
        tone: "warning",
        colorClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-800",
    },
    USER: {
        label: "Người dùng",
        tone: "info",
        colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-800",
    },
};

export function getRoleLabel(role?: UserRole): string {
    if (!role) {
        return "Chưa xác định";
    }
    return ROLE_MAP[role]?.label || role;
}

export function getRoleTone(role?: UserRole) {
    if (!role) {
        return "neutral";
    }
    return ROLE_MAP[role]?.tone || "neutral";
}


export function getRoleConfig(role?: UserRole): RoleConfig {
    return (
        ROLE_MAP[role || ""] || {
            label: role || "N/A",
            tone: "neutral",
            colorClass: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
        }
    );
}