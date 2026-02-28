import { notFound } from "next/navigation";
import { getAdminModel } from "@/lib/data/admin-dashboard";
import { deleteVariant } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { Button } from "@/components/ui/button";
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
import { Plus, Pencil } from "lucide-react";
import { formatPrice, FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";

type tParams = Promise<{ id: string }>;
interface PageProps {
  params: tParams;
}

export default async function AdminVariantsPage(props: PageProps) {
  const { id } = await props.params;
  const model = await getAdminModel(id);
  if (!model) notFound();

  return (
    <>
      <PageHeader
        title={`${model.brand.name} ${model.name} — Variants`}
        description={`${model.variants.length} variant${model.variants.length !== 1 ? "s" : ""}`}
        actions={
          <Button asChild>
            <Link href={`/admin/catalog/models/${id}/variants/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Link>
          </Button>
        }
      />

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Fuel</TableHead>
              <TableHead>Transmission</TableHead>
              <TableHead>Engine</TableHead>
              <TableHead>Power</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.variants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No variants yet. Add the first variant for this model.
                </TableCell>
              </TableRow>
            ) : (
              model.variants.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-muted-foreground">{v.slug}</TableCell>
                  <TableCell>
                    {v.fuelType ? (
                      <Badge variant="secondary">
                        {FUEL_TYPE_LABELS[v.fuelType] ?? v.fuelType}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {v.transmission ? (
                      <Badge variant="outline">
                        {TRANSMISSION_LABELS[v.transmission] ?? v.transmission}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{v.engine ?? "—"}</TableCell>
                  <TableCell>{v.power ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {v.exShowroomPrice != null
                      ? formatPrice(Number(v.exShowroomPrice))
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/catalog/models/${id}/variants/${v.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only md:not-sr-only md:ml-1">Edit</span>
                        </Link>
                      </Button>
                      <AdminDeleteButton deleteAction={deleteVariant} itemId={v.id} />
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
