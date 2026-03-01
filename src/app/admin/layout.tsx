import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden border-r bg-card md:flex md:w-64 lg:w-72">
        <AdminSidebar userName={user.name ?? user.email} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader userName={user.name ?? user.email} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
