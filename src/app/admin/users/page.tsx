import { getAdminUsers } from "@/lib/data/admin-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import Link from "next/link";
import type { UserRole } from "@/generated/prisma";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  searchParams: tSearchParams;
}

const ROLE_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "BUYER", label: "Buyer" },
  { value: "DEALER", label: "Dealer" },
  { value: "ADMIN", label: "Admin" },
];

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const roleParam = typeof sp.role === "string" ? sp.role : undefined;
  const searchParam = typeof sp.search === "string" ? sp.search : undefined;
  const pageParam = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const { users, total, page, totalPages } = await getAdminUsers({
    role:
      roleParam && roleParam !== "all"
        ? (roleParam as UserRole)
        : undefined,
    search: searchParam,
    page: pageParam,
  });

  return (
    <>
      <PageHeader
        title="User Management"
        description={`${total} user${total !== 1 ? "s" : ""}`}
      />

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {ROLE_TABS.map((tab) => {
          const isActive =
            (tab.value === "all" && !roleParam) || roleParam === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildFilterUrl(sp, "role", tab.value === "all" ? undefined : tab.value)}
            >
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
              >
                {tab.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <form className="flex items-center gap-2">
          {roleParam && <input type="hidden" name="role" value={roleParam} />}
          <Input
            name="search"
            placeholder="Search users…"
            defaultValue={searchParam ?? ""}
            className="w-64"
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {users.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No users found.
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Dealer</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Reviews</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {user.dealer ? (
                        <Link
                          href={`/admin/dealers/${user.dealer.id}`}
                          className="text-primary hover:underline"
                        >
                          {user.dealer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user._count.leadsAsBuyer}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user._count.reviews}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleSelect
                        userId={user.id}
                        currentRole={user.role}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildPageUrl(sp, page - 1)}>Previous</Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildPageUrl(sp, page + 1)}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function buildFilterUrl(
  sp: Record<string, string | string[] | undefined>,
  key: string,
  value: string | undefined,
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page" && k !== key) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return `/admin/users${qs ? `?${qs}` : ""}`;
}

function buildPageUrl(
  sp: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") params.set(k, v);
  }
  params.set("page", String(page));
  return `/admin/users?${params.toString()}`;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    ADMIN: "default",
    DEALER: "secondary",
    BUYER: "outline",
  };
  return (
    <Badge variant={map[role] ?? "outline"} className="text-xs">
      {role}
    </Badge>
  );
}
