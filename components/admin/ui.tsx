"use client";

import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 dark:shadow-none",
    secondary:
      "border border-slate-200/80 bg-white/45 text-slate-700 hover:bg-white/75 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800",
    ghost: "text-slate-500 hover:bg-slate-500/10 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
    danger: "bg-rose-600 text-white shadow-lg shadow-rose-200/40 hover:bg-rose-700 dark:shadow-none",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
}

export function Input({
  label,
  icon,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label && <span className="mb-2 block">{label}</span>}
      <span className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/45 px-3.5 text-slate-400 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700/80 dark:bg-slate-900/35">
        {icon}
        <input
          {...props}
          className={`w-full bg-transparent py-2.5 text-sm font-normal text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 ${className}`}
        />
      </span>
    </label>
  );
}

export function Select({
  label,
  options,
  value = "",
  onChange,
  placeholder = "Chọn một giá trị...",
}: {
  label?: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }

    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div
      ref={containerRef}
      className="relative block text-sm font-semibold text-slate-700 dark:text-slate-200"
    >
      {label && <span className="mb-2 block">{label}</span>}
      <input
        tabIndex={-1}
        required
        value={value}
        onChange={() => undefined}
        className="sr-only"
        aria-hidden="true"
      />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-11 w-full items-center justify-between rounded-xl border bg-white/45 px-3.5 text-left text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-900/35 ${open ? "border-indigo-400 ring-4 ring-indigo-500/10" : "border-slate-200/80 dark:border-slate-700/80"}`}
      >
        <span
          className={
            selected
              ? "text-slate-800 dark:text-slate-100"
              : "text-slate-400"
          }
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180 text-indigo-500" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="glass-panel absolute inset-x-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl p-1.5 shadow-[0_18px_45px_rgb(15_23_42/0.2)]"
        >
          {options.length ? (
            options.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${option.value === value ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200" : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-slate-800"}`}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm font-normal text-slate-500">
              Chưa có lựa chọn
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function FilterBar({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/25 p-3 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/20 sm:flex-row sm:items-center">
      <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 sm:block" />
      {children}
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          Đặt lại
        </button>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
          Trang quản trị
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  color = "indigo",
}: {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/15",
  };
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl ${colors[color]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <ArrowUpRight className="h-3.5 w-3.5" />
        {trend}{" "}
        <span className="font-normal text-slate-400">
          so với tháng trước
        </span>
      </p>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  const tones = {
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone as keyof typeof tones] ?? tones.neutral}`}
    >
      {children}
    </span>
  );
}

export function SearchBox({
  placeholder = "Tìm kiếm...",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      icon={<Search className="h-4 w-4" />}
      placeholder={placeholder}
      aria-label={props["aria-label"] ?? placeholder}
      className="min-w-0"
    />
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-panel rounded-2xl border-dashed px-6 py-12 text-center text-sm text-slate-600 dark:text-slate-300">
      {message}
    </div>
  );
}

export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      {children}
    </div>
  );
}

export function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
}: {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const safeTotal = Math.max(1, totalPages);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 px-5 py-4 text-sm dark:border-slate-700/60">
      <p className="text-xs text-slate-400">
        Trang{" "}
        <strong className="text-slate-700 dark:text-slate-200">
          {page}
        </strong>{" "}
        / {safeTotal}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200/70 text-slate-500 transition hover:bg-white/60 disabled:opacity-40 dark:border-slate-700"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(safeTotal, 5) }, (_, index) => {
          const number =
            Math.max(1, Math.min(page - 2, safeTotal - 4)) + index;
          return (
            <button
              key={number}
              onClick={() => onPageChange?.(number)}
              className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold transition ${number === page ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-none" : "text-slate-500 hover:bg-white/60 dark:hover:bg-slate-800"}`}
            >
              {number}
            </button>
          );
        })}
        <button
          disabled={page >= safeTotal}
          onClick={() => onPageChange?.(page + 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200/70 text-slate-500 transition hover:bg-white/60 disabled:opacity-40 dark:border-slate-700"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const tableHeadClass =
  "bg-slate-100/65 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800/55 dark:text-slate-300";
export const tableCellClass =
  "px-5 py-4 text-sm text-slate-700 dark:text-slate-200";
