import { getAdminBrands } from "@/lib/data/admin-dashboard";
import { deleteBrand } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { Button } from "@/components/ui/button";
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
import { Plus, Pencil, List } from "lucide-react";

export default async function AdminCatalogPage() {
  const brands = await getAdminBrands();

  return (
    <>
      <PageHeader
        title="Car Catalog"
        description="Manage brands, models, and variants"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/catalog/models">
                <List className="mr-2 h-4 w-4" />
                View Models
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/catalog/brands/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Link>
            </Button>
          </div>
        }
      />

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Models</TableHead>
              <TableHead className="text-right">Dealers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No brands found. Add your first brand to get started.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                  <TableCell>{brand.country ?? "—"}</TableCell>
                  <TableCell className="text-right">{brand._count.models}</TableCell>
                  <TableCell className="text-right">{brand._count.dealerBrands}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/catalog/brands/${brand.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only md:not-sr-only md:ml-1">Edit</span>
                        </Link>
                      </Button>
                      <AdminDeleteButton deleteAction={deleteBrand} itemId={brand.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
