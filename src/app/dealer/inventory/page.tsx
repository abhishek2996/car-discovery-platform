import { requireDealer } from "@/lib/auth";
import { getDealerInventory } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/constants";
import { InventoryFiltersBar } from "@/components/dealer/inventory-filters";
import { DeleteInventoryButton } from "@/components/dealer/delete-inventory-button";
import { EmptyState } from "@/components/ui/empty-state";

type tParams = Promise<Record<string, never>>;
type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: tParams;
  searchParams: tSearchParams;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const user = await requireDealer();
  const sp = await searchParams;
  const filters = {
    search: typeof sp.search === "string" ? sp.search : undefined,
    stockStatus: typeof sp.stockStatus === "string" ? sp.stockStatus : undefined,
    visibility: typeof sp.visibility === "string" ? sp.visibility : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page:
      typeof sp.page === "string"
        ? Math.max(1, parseInt(sp.page, 10) || 1)
        : 1,
  };

  const { items, total, page, totalPages } = await getDealerInventory(
    user.dealerId!,
    filters,
  );

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`${total} item${total !== 1 ? "s" : ""} in your inventory`}
        actions={
          <Button asChild>
            <Link href="/dealer/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Link>
          </Button>
        }
      />

      <InventoryFiltersBar />

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No inventory items found"
            description="Add your first car variant to start managing your inventory and receiving leads."
            actionLabel="Add your first item"
            actionHref="/dealer/inventory/new"
          />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Car</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">On-road Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="px-4 py-3 font-medium">Offers</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">
                      {item.variant.model.brand.name} {item.variant.model.name}
                    </td>
                    <td className="px-4 py-3">{item.variant.name}</td>
                    <td className="px-4 py-3">
                      {item.onRoadPrice
                        ? formatPrice(item.onRoadPrice.toString())
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge status={item.stockStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <VisibilityBadge visibility={item.visibility} />
                    </td>
                    <td className="px-4 py-3">
                      {item.offers ? (
                        <Badge variant="secondary" className="text-xs">
                          {JSON.parse(item.offers).length} offer(s)
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dealer/inventory/${item.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <DeleteInventoryButton itemId={item.id} />
                      </div>
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
                    <Link
                      href={`/dealer/inventory?${new URLSearchParams({
                        ...Object.fromEntries(
                          Object.entries(filters).filter(
                            ([, v]) => v !== undefined,
                          ) as [string, string][],
                        ),
                        page: String(page - 1),
                      })}`}
                    >
                      Previous
                    </Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/dealer/inventory?${new URLSearchParams({
                        ...Object.fromEntries(
                          Object.entries(filters).filter(
                            ([, v]) => v !== undefined,
                          ) as [string, string][],
                        ),
                        page: String(page + 1),
                      })}`}
                    >
                      Next
                    </Link>
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

function StockBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const map: Record<string, "default" | "secondary" | "destructive"> = {
    IN_STOCK: "default",
    EXPECTED: "secondary",
    OUT_OF_STOCK: "destructive",
  };
  return (
    <Badge variant={map[status] ?? "secondary"} className="text-xs">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    VISIBLE: "default",
    DRAFT: "secondary",
    HIDDEN: "outline",
  };
  return (
    <Badge variant={map[visibility] ?? "secondary"} className="text-xs">
      {visibility.charAt(0) + visibility.slice(1).toLowerCase()}
    </Badge>
  );
}
