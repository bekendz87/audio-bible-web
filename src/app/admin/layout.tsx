import { AdminShell } from "@/components/admin/AdminShell";
import { PermissionProvider } from "@/components/PermissionProvider";
import { ActionFeedback } from "@/components/admin/ActionFeedback";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionProvider>
            <ActionFeedback>
                <AdminShell>{children}</AdminShell>
            </ActionFeedback>
        </PermissionProvider>
    );
}
