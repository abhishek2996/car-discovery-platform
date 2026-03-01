import { getAdminModels, getAdminBrands } from "@/lib/data/admin-dashboard";
import { deleteModel } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import Link from "next/link";
import { Plus, Pencil, Layers } from "lucide-react";
import { formatPrice, BODY_TYPE_LABELS } from "@/lib/constants";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  searchParams: tSearchParams;
}

export default async function AdminModelsPage(props: PageProps) {
  const sp = await props.searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const brandId = typeof sp.brandId === "string" ? sp.brandId : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const [{ models, total, totalPages }, brands] = await Promise.all([
    getAdminModels({ search, brandId, page }),
    getAdminBrands(),
  ]);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { search, brandId, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "" && v !== "all") params.set(k, v);
    }
    params.delete("page");
    if (overrides.page && overrides.page !== "1") params.set("page", overrides.page);
    const qs = params.toString();
    return `/admin/catalog/models${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <PageHeader
        title="Models"
        description={`${total} model${total !== 1 ? "s" : ""} across all brands`}
        actions={
          <Button asChild>
            <Link href="/admin/catalog/models/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Model
            </Link>
          </Button>
        }
      />

      <section className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <form className="flex flex-wrap items-center gap-3">
          <Input
            name="search"
            placeholder="Search models…"
            defaultValue={search ?? ""}
            className="max-w-xs"
          />
          <select
            name="brandId"
            defaultValue={brandId ?? ""}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
          {(search || brandId) && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/catalog/models">Clear</Link>
            </Button>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Body Type</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Min Price</TableHead>
              <TableHead className="text-right">Max Price</TableHead>
              <TableHead className="text-right">Variants</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No models found.
                </TableCell>
              </TableRow>
            ) : (
              models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.brand.name}</TableCell>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell className="text-muted-foreground">{model.slug}</TableCell>
                  <TableCell>
                    {model.bodyType ? (
                      <Badge variant="secondary">
                        {BODY_TYPE_LABELS[model.bodyType] ?? model.bodyType}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{model.segment ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {model.minPrice != null ? formatPrice(Number(model.minPrice)) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {model.maxPrice != null ? formatPrice(Number(model.maxPrice)) : "—"}
                  </TableCell>
                  <TableCell className="text-right">{model._count.variants}</TableCell>
                  <TableCell className="text-right">{model._count.leads}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/catalog/models/${model.id}/variants`}>
                          <Layers className="h-3.5 w-3.5" />
                          <span className="sr-only md:not-sr-only md:ml-1">Variants</span>
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/catalog/models/${model.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only md:not-sr-only md:ml-1">Edit</span>
                        </Link>
                      </Button>
                      <AdminDeleteButton deleteAction={deleteModel} itemId={model.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page - 1) })}>Previous</Link>
                </Button>
              )}
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildUrl({ page: String(page + 1) })}>Next</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
