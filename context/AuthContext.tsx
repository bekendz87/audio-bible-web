"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

export interface User {
    id: string;
    email: string;
    role: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setLoading(true);

        const savedToken = Cookies.get("accessToken");
        const savedUser = localStorage.getItem("userInfo");

        if (savedToken) {
            setToken(savedToken);
        } else {
            setToken(null);
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Lỗi parse thông tin user từ localStorage:", e);
            }
        } else {
            setUser(null);
        }

        const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

        if (savedToken && isPublicRoute) {
            router.replace("/admin");
        } else if (!savedToken && !isPublicRoute) {
            router.replace("/login");
        }

        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);


        return () => clearTimeout(timer);
    }, [pathname, router]);

    const login = (newToken: string, userData: User) => {
        Cookies.set("accessToken", newToken, {
            expires: 1,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        localStorage.setItem("userInfo", JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);

        router.replace("/admin");
    };

    const logout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        localStorage.removeItem("userInfo");

        setToken(null);
        setUser(null);

        router.replace("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                loading,
            }}
        >
            {loading ? (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 transition-opacity duration-300 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="text-xs font-medium text-slate-500 animate-pulse">Đang xác thực hệ thống...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được bọc bên trong AuthProvider");
    }
    return context;
};