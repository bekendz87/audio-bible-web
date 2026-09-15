import { TableSkeleton } from "@/components/admin/feedback";

export default function AdminLoading() {
    return (
        <div className="space-y-6" aria-live="polite">
            <div className="space-y-3">
                <div className="skeleton h-3 w-28" />
                <div className="skeleton h-9 w-56" />
                <div className="skeleton h-4 w-80 max-w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        className="glass-panel h-36 rounded-2xl p-5"
                        key={index}
                    >
                        <div className="skeleton h-4 w-28" />
                        <div className="skeleton mt-4 h-8 w-20" />
                        <div className="skeleton mt-5 h-3 w-36" />
                    </div>
                ))}
            </div>
            <div className="glass-panel overflow-hidden rounded-2xl">
                <TableSkeleton />
            </div>
        </div>
    );
}
