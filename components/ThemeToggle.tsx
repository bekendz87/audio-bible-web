"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-2xl bg-white/30 dark:bg-slate-800/40 backdrop-blur-glass border border-white/40 dark:border-white/10 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Toggle Theme"
        >
            {theme === "dark" ?
                <Sun className="w-5 h-5 text-amber-400" /> :
                <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
    );
}