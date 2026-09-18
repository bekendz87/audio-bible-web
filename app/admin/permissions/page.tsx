"use client";

import React, { useState, useEffect, useMemo } from "react"
import {
    ShieldCheck,
    Users,
    Folder,
    ArrowRight,
    Search,
    ShieldOff,
    X,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Loader2,
    Lock
} from "lucide-react"

import { useAutoPermissions } from "@/components/PermissionProvider";
import { permissionService } from "@/services/permissions"
import {
    Badge,
    Button,
    PageHeader,
    Pagination,
    SearchBox,
    TableCard,
    tableCellClass,
    tableHeadClass,
} from "@/components/admin/ui";

const MODULE_NAME_MAP: Record<string, string> = {
    analytics: "Thống kê & Báo cáo",
    book: "Quản lý Sách",
    books: "Quản lý Sách",
    category: "Quản lý Danh mục",
    categories: "Quản lý Danh mục",
    chapter: "Quản lý Chương",
    chapters: "Quản lý Chương",
    user: "Quản lý Người dùng",
    users: "Quản lý Người dùng",
    upload: "Tải lên & Tệp tin",
    author: "Quản lý Tác giả",
    authors: "Quản lý Tác giả",
    voice: "Quản lý Giọng đọc",
    voices: "Quản lý Giọng đọc",
    permission: "Quản lý Phân quyền",
    permissions: "Quản lý Phân quyền",
    log: "Nhật ký Hệ thống",
    logs: "Nhật ký Hệ thống"
}

const formatModuleName = (rawModule: string) => {
    if (!rawModule) {
        return "Khác"
    }
    const key = rawModule.trim().toLowerCase()
    return MODULE_NAME_MAP[key] || rawModule.charAt(0).toUpperCase() + rawModule.slice(1).toLowerCase()
}

const formatActionTitle = (method: string, clientPath: string, rawModule: string) => {
    const isDetail = clientPath.includes("/:id") || clientPath.toLowerCase().includes("detail")
    const modTitle = formatModuleName(rawModule).replace("Quản lý ", "")

    let titleUpload = ""
    if (clientPath.toLowerCase().includes("audio")) {
        titleUpload = "Tải lên Audio"
    } else if (clientPath.toLowerCase().includes("images")) {
        titleUpload = "Tải lên Hình ảnh"
    }

    let actionPrefix = ""
    switch (method.toUpperCase()) {
        case "GET":
            actionPrefix = isDetail ? "Xem chi tiết" : "Xem danh sách"
            break
        case "POST":
            actionPrefix = clientPath.toLowerCase().includes("upload") ? titleUpload : "Tạo mới"
            break
        case "PUT":
            actionPrefix = "Cập nhật"
            break
        case "DELETE":
            actionPrefix = "Xóa"
            break
        default:
            actionPrefix = `Thực hiện ${method}`
    }

    return titleUpload !== "" ? `${actionPrefix}` : `${actionPrefix} ${modTitle}`
}

export default function PermissionsPage() {
    const { scannedModules, canAccess, loading: permissionsLoading, refetchPermissions } = useAutoPermissions()

    const canViewPage = canAccess("GET", "/permissions")
    const canManagePermission = canAccess("POST", "/permissions")

    const [activeMainTab, setActiveMainTab] = useState<"permissions" | "user-permissions">("permissions")
    const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0)
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [userSearchQuery, setUserSearchQuery] = useState("")
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [userPermissionsOverview, setUserPermissionsOverview] = useState<Record<string, string[]>>({})

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerMode, setDrawerMode] = useState<"assign" | "revoke">("assign")
    const [selectedApi, setSelectedApi] = useState<{ code: string; name: string; method: string; path: string } | null>(null)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const filteredModules = useMemo(() => {
        if (!scannedModules) return []

        return scannedModules
            .filter((mod: any) => mod.module?.toLowerCase() !== "auth")
            .map((mod: any) => ({
                ...mod,
                features: mod.features
                    .map((feat: any) => ({
                        ...feat,
                        apis: feat.apis.filter((apiItem: any) => {
                            const path = apiItem.clientPath?.toLowerCase() || ""
                            return !path.includes("login") && !path.includes("logout") && !path.includes("refresh")
                        })
                    }))
                    .filter((feat: any) => feat.apis.length > 0)
            }))
            .filter((mod: any) => mod.features.length > 0)
    }, [scannedModules])

    useEffect(() => {
        fetchUsersData()
    }, [activeMainTab, drawerOpen])

    const fetchUsersData = async () => {
        setLoadingUsers(true)
        try {
            const [userRes, overviewRes]: any = await Promise.all([
                permissionService.getPermissionUsers().catch(() => []),
                // permissionService.getAllAssignedPermissions("ALL").catch(() => [])
            ])

            const users = Array.isArray(userRes?.content) ? userRes.content : Array.isArray(userRes) ? userRes : []
            setAllUsers(users)

            const list = Array.isArray(overviewRes?.data) ? overviewRes.data : Array.isArray(overviewRes) ? overviewRes : []
            const overview: Record<string, string[]> = {}
            list.forEach((item: any) => {
                if (item?.userID && item?.code) {
                    const uId = String(item.userID)
                    if (!overview[uId]) overview[uId] = []
                    if (!overview[uId].includes(item.code)) overview[uId].push(item.code)
                }
            })
            setUserPermissionsOverview(overview)
        } catch (err) {
            console.error("Lỗi tải thông tin tài khoản:", err)
        } finally {
            setLoadingUsers(false)
        }
    }

    const handleOpenDrawer = (apiItem: any, mode: "assign" | "revoke") => {
        const currentMod = filteredModules[selectedModuleIndex]
        const friendlyName = formatActionTitle(apiItem.method, apiItem.clientPath, currentMod?.module || "")

        setSelectedApi({
            code: apiItem.code,
            name: friendlyName,
            method: apiItem.method,
            path: apiItem.clientPath
        })
        setDrawerMode(mode)
        setSelectedUserIds([])
        setDrawerOpen(true)
    }

    // --- TOGGLE CHỌN USER ---
    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        )
    }

    // --- XỬ LÝ SUBMIT CẤP / THU HỒI ---
    const handleSubmitPermission = async () => {
        if (!selectedApi || selectedUserIds.length === 0) return

        setIsSubmitting(true)
        try {
            const currentMod = filteredModules[selectedModuleIndex]

            // Lặp qua danh sách user đã chọn để gửi request
            for (const uId of selectedUserIds) {
                const payload = {
                    code: selectedApi.code,
                    name: selectedApi.name,
                    module: currentMod?.module || "",
                    method: selectedApi.method,
                    clientPath: selectedApi.path,
                    userID: parseInt(uId, 10)
                }

                if (drawerMode === "assign") {
                    // await permissionService.permissionAddRole(payload)
                } else {
                    // await permissionService.removePermissions(payload)
                }
            }

            setDrawerOpen(false)
            if (refetchPermissions) await refetchPermissions()
            await fetchUsersData()
        } catch (error) {
            console.error("Lỗi khi cập nhật quyền:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredUsers = useMemo(() => {
        return allUsers.filter(
            (u: any) =>
                u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.phone?.includes(userSearchQuery) ||
                u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase())
        )
    }, [allUsers, userSearchQuery])

    const categorizedUsers = useMemo(() => {
        const fullyAssigned: any[] = []
        const partiallyAssigned: any[] = []
        const unassigned: any[] = []

        if (!selectedApi) return { fullyAssigned, partiallyAssigned, unassigned }

        const currentModuleApis =
            filteredModules[selectedModuleIndex]?.features.flatMap((f: any) => f.apis) || []
        const moduleApiCodes = currentModuleApis.map((a: any) => a.code)

        filteredUsers.forEach((user: any) => {
            const uId = String(user.id)
            const userCodes = userPermissionsOverview[uId] || []

            if (selectedApi.code === "BULK") {
                const matchCount = moduleApiCodes.filter((c: string) => userCodes.includes(c)).length
                if (matchCount === moduleApiCodes.length && moduleApiCodes.length > 0) {
                    fullyAssigned.push(user)
                } else if (matchCount > 0) {
                    partiallyAssigned.push(user)
                } else {
                    unassigned.push(user)
                }
            } else {
                if (userCodes.includes(selectedApi.code)) {
                    fullyAssigned.push(user)
                } else {
                    unassigned.push(user)
                }
            }
        })

        return { fullyAssigned, partiallyAssigned, unassigned }
    }, [filteredUsers, selectedApi, userPermissionsOverview, filteredModules, selectedModuleIndex])

    if (permissionsLoading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!canViewPage) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <Lock className="w-12 h-12 stroke-[1.5] text-rose-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Truy cập bị từ chối</h3>
                <p className="text-xs">Bạn không có quyền xem trang Quản trị Phân Quyền.</p>
            </div>
        )
    }

    const currentModule = filteredModules[selectedModuleIndex]
    const currentApis = currentModule?.features.flatMap((f: any) => f.apis) || []

    const renderDrawerUserRow = (user: any, statusTag: "assigned" | "partial" | "unassigned") => {
        const uId = String(user.id)
        const isChecked = selectedUserIds.includes(uId)

        return (
            <div
                key={uId}
                onClick={() => toggleUserSelection(uId)}
                className={`p-3 flex items-center justify-between cursor-pointer transition-all duration-150 rounded-xl mb-1.5 ${isChecked
                    ? "bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-300 dark:border-indigo-800 shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { }}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {user.displayName || user.name || "Chưa đặt tên"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                            {user.email || user.phone || `ID: ${user.id}`} · {user.role || "User"}
                        </p>
                    </div>
                </div>

                <div>
                    {statusTag === "assigned" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" /> Đã cấp
                        </span>
                    )}
                    {statusTag === "partial" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60">
                            <AlertCircle className="w-3 h-3" /> Một phần
                        </span>
                    )}
                    {statusTag === "unassigned" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3 h-3" /> Chưa cấp
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quản Trị Phân Quyền Hệ Thống"
                description="Giao diện cấp phát và thu hồi quyền trực tiếp theo từng tài khoản sử dụng."
            />

            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-slate-800/60 shadow-sm">
                <button
                    type="button"
                    onClick={() => setActiveMainTab("permissions")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${activeMainTab === "permissions"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
                        }`}
                >
                    <ShieldCheck className="w-4 h-4" /> Phân Quyền Theo Module
                </button>
                <button
                    type="button"
                    onClick={() => setActiveMainTab("user-permissions")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${activeMainTab === "user-permissions"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
                        }`}
                >
                    <Users className="w-4 h-4" /> Tổng Hợp Quyền Tài Khoản
                </button>
            </div>

            {activeMainTab === "permissions" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="space-y-3">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-2">
                            <Folder className="w-3.5 h-3.5 text-indigo-500" /> PHÂN NHÓM CHỨC NĂNG
                        </div>

                        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/40 shadow-sm p-1.5">
                            {filteredModules.map((mod: any, idx: number) => {
                                const isSelected = selectedModuleIndex === idx
                                const displayName = formatModuleName(mod.module)
                                const apiCount = mod.features.flatMap((f: any) => f.apis).length

                                return (
                                    <div
                                        key={mod.module || idx}
                                        onClick={() => setSelectedModuleIndex(idx)}
                                        className={`p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 text-xs ${isSelected
                                            ? "bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold shadow-sm border border-indigo-200/50 dark:border-indigo-800/50"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* <Folder className="w-4 h-4 text-indigo-500/80 stroke-[1.5]" /> */}
                                            <span>{displayName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                                                {apiCount} API
                                            </span>
                                            <ArrowRight
                                                className={`w-3.5 h-3.5 transition-transform ${isSelected ? "opacity-100 translate-x-0.5 text-indigo-600" : "opacity-0"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                CHỨC NĂNG HỆ THỐNG:{" "}
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                                    {formatModuleName(currentModule?.module || "")}
                                </span>
                            </div>

                            {currentApis.length > 0 && canManagePermission && (
                                <button
                                    onClick={() =>
                                        handleOpenDrawer(
                                            { code: "BULK", method: "ALL", clientPath: "*" },
                                            "assign"
                                        )
                                    }
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl font-semibold transition-all text-[11px] shadow-sm"
                                >
                                    <Users className="w-3.5 h-3.5" /> Cấp tất cả quyền danh mục này
                                </button>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 p-5 space-y-4 shadow-sm">
                            {currentApis.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8">
                                    Chưa phát hiện chức năng nào thuộc danh mục này.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                    {currentApis.map((apiItem: any) => {
                                        const friendlyName = formatActionTitle(
                                            apiItem.method,
                                            apiItem.clientPath,
                                            currentModule?.module || ""
                                        )

                                        return (
                                            <div
                                                key={apiItem.code}
                                                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                                            >
                                                <div className="space-y-1.5 max-w-[70%]">
                                                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                                        {friendlyName}
                                                    </div>
                                                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg w-fit">
                                                        <span
                                                            className={`uppercase font-extrabold ${apiItem.method === "GET"
                                                                ? "text-emerald-600"
                                                                : apiItem.method === "POST"
                                                                    ? "text-blue-600"
                                                                    : apiItem.method === "PUT"
                                                                        ? "text-amber-600"
                                                                        : "text-rose-600"
                                                                }`}
                                                        >
                                                            {apiItem.method}
                                                        </span>
                                                        <span>{apiItem.clientPath}</span>
                                                    </div>
                                                </div>

                                                {canManagePermission && (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleOpenDrawer(apiItem, "assign")}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all text-[11px] shadow-sm shadow-indigo-500/20"
                                                        >
                                                            <Users className="w-3 h-3 stroke-[2]" /> Cấp quyền
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDrawer(apiItem, "revoke")}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-xl font-medium transition-all text-[11px]"
                                                        >
                                                            <ShieldOff className="w-3.5 h-3.5 stroke-[2]" /> Thu hồi
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Danh sách tài khoản ({allUsers.length})
                        </span>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm tài khoản..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {filteredUsers.map((user: any) => {
                            const uId = String(user.id)
                            const userCodes = userPermissionsOverview[uId] || []

                            return (
                                <div key={uId} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                            {user.displayName || user.name || "Chưa đặt tên"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                            {user.email || user.phone || `ID: ${user.id}`} · {user.role || "User"}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                                        {userCodes.length} quyền đã cấp
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {drawerOpen && selectedApi && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => !isSubmitting && setDrawerOpen(false)} />
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl relative z-10">
                        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span
                                        className={`inline-flex items-center gap-1 text-[9px] font-mono tracking-wider font-bold uppercase px-2 py-0.5 rounded-md ${drawerMode === "assign"
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                            }`}
                                    >
                                        {drawerMode === "assign" ? "CẤP PHÁT QUYỀN HỆ THỐNG" : "THU HỒI QUYỀN TRỰC TIẾP"}
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-1">
                                        {selectedApi.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        Mã Code: <span className="text-slate-700 dark:text-slate-300">{selectedApi.code}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    disabled={isSubmitting}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative w-full shrink-0">
                                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    placeholder="Tìm theo tên hoặc email tài khoản..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                {drawerMode === "assign" ? (
                                    <>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between px-1">
                                                <span>Chưa cấp quyền ({categorizedUsers.unassigned.length})</span>
                                            </div>
                                            {categorizedUsers.unassigned.length === 0 ? (
                                                <p className="text-[11px] text-slate-400 italic py-1 px-1">Không có tài khoản nào.</p>
                                            ) : (
                                                categorizedUsers.unassigned.map((u) => renderDrawerUserRow(u, "unassigned"))
                                            )}
                                        </div>

                                        {selectedApi.code === "BULK" && (
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex justify-between px-1">
                                                    <span>Đã cấp một phần ({categorizedUsers.partiallyAssigned.length})</span>
                                                </div>
                                                {categorizedUsers.partiallyAssigned.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 italic py-1 px-1">Không có tài khoản nào.</p>
                                                ) : (
                                                    categorizedUsers.partiallyAssigned.map((u) => renderDrawerUserRow(u, "partial"))
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex justify-between px-1">
                                                <span>Đã cấp đủ quyền ({categorizedUsers.fullyAssigned.length})</span>
                                            </div>
                                            {categorizedUsers.fullyAssigned.length === 0 ? (
                                                <p className="text-[11px] text-slate-400 italic py-1 px-1">Chưa có tài khoản nào.</p>
                                            ) : (
                                                categorizedUsers.fullyAssigned.map((u) => renderDrawerUserRow(u, "assigned"))
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex justify-between px-1">
                                            <span>
                                                Chọn tài khoản để thu hồi (
                                                {[...categorizedUsers.fullyAssigned, ...categorizedUsers.partiallyAssigned].length})
                                            </span>
                                        </div>
                                        {[...categorizedUsers.fullyAssigned, ...categorizedUsers.partiallyAssigned].length === 0 ? (
                                            <p className="text-[11px] text-slate-400 italic py-2 px-1">
                                                Không có tài khoản nào sở hữu quyền này.
                                            </p>
                                        ) : (
                                            [...categorizedUsers.fullyAssigned, ...categorizedUsers.partiallyAssigned].map((u) =>
                                                renderDrawerUserRow(u, "assigned")
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
                            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                <span>Số tài khoản đã chọn:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {selectedUserIds.length} người
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setDrawerOpen(false)}
                                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting || selectedUserIds.length === 0}
                                    onClick={handleSubmitPermission}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md ${drawerMode === "assign"
                                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 disabled:bg-indigo-300"
                                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 disabled:bg-rose-300"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>{drawerMode === "assign" ? "Xác nhận cấp" : "Xác nhận thu hồi"}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}