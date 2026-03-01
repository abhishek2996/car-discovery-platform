import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  getAdminArticles,
  getAdminUpcomingCars,
  getAdminHeroSlides,
  type AdminContentFilters,
} from "@/lib/data/admin-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Pencil, Search } from "lucide-react";
import {
  PublishToggleButton,
  DeleteArticleButton,
  DeleteUpcomingButton,
  DeleteHeroSlideButton,
} from "@/components/admin/content-actions";
import type { ContentArticleType } from "@/generated/prisma";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

const ARTICLE_TYPES: { value: ContentArticleType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEWS", label: "News" },
  { value: "EXPERT_REVIEW", label: "Expert Review" },
  { value: "FEATURE", label: "Feature" },
  { value: "COMPARISON", label: "Comparison" },
];

const TYPE_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEWS: "default",
  EXPERT_REVIEW: "secondary",
  FEATURE: "outline",
  COMPARISON: "secondary",
};

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: tSearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const tab = typeof sp.tab === "string" ? sp.tab : "articles";
  const typeFilter = typeof sp.type === "string" ? sp.type : undefined;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const pageParam = sp.page;
  const page = typeof pageParam === "string" ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  const articleFilters: AdminContentFilters = { page };
  if (typeFilter && typeFilter !== "ALL") {
    articleFilters.type = typeFilter as ContentArticleType;
  }
  if (search) articleFilters.search = search;

  const [articlesData, upcomingCars, heroSlides] = await Promise.all([
    getAdminArticles(articleFilters),
    getAdminUpcomingCars(search),
    getAdminHeroSlides(),
  ]);

  return (
    <>
      <PageHeader
        title="Content Management"
        description="Manage articles, news, reviews, and upcoming cars"
      />

      <Tabs defaultValue={tab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Cars</TabsTrigger>
          <TabsTrigger value="hero">Hero Slider</TabsTrigger>
        </TabsList>

        {/* ── Articles tab ─────────────────────────────────────── */}
        <TabsContent value="articles" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {ARTICLE_TYPES.map((t) => {
                const isActive =
                  t.value === "ALL"
                    ? !typeFilter || typeFilter === "ALL"
                    : typeFilter === t.value;
                return (
                  <Link
                    key={t.value}
                    href={`/admin/content?tab=articles&type=${t.value}${search ? `&search=${search}` : ""}`}
                  >
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {t.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <form className="relative">
                <input type="hidden" name="tab" value="articles" />
                {typeFilter && (
                  <input type="hidden" name="type" value={typeFilter} />
                )}
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search articles..."
                  defaultValue={search ?? ""}
                  className="w-56 pl-8"
                />
              </form>
              <Button asChild>
                <Link href="/admin/content/articles/new">
                  <Plus className="mr-1 h-4 w-4" /> New Article
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                    Slug
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                    Tags
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articlesData.articles.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No articles found.
                    </td>
                  </tr>
                )}
                {articlesData.articles.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/30">
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium">
                      {article.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={TYPE_BADGE_VARIANT[article.type] ?? "outline"}>
                        {article.type.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="hidden max-w-[140px] truncate px-4 py-3 text-muted-foreground md:table-cell">
                      {article.slug}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {article.author?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {article.publishedAt ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </td>
                    <td className="hidden max-w-[120px] truncate px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {article.tags || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {new Date(article.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/content/articles/${article.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only md:not-sr-only md:ml-1">
                              Edit
                            </span>
                          </Link>
                        </Button>
                        <PublishToggleButton
                          articleId={article.id}
                          isPublished={!!article.publishedAt}
                        />
                        <DeleteArticleButton articleId={article.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {articlesData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: articlesData.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={`/admin/content?tab=articles${typeFilter ? `&type=${typeFilter}` : ""}${search ? `&search=${search}` : ""}&page=${p}`}
                  >
                    <Button
                      size="sm"
                      variant={p === articlesData.page ? "default" : "outline"}
                    >
                      {p}
                    </Button>
                  </Link>
                ),
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Upcoming Cars tab ────────────────────────────────── */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button asChild>
              <Link href="/admin/content/upcoming/new">
                <Plus className="mr-1 h-4 w-4" /> Add Upcoming Car
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Brand</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                    Expected Launch
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                    Estimated Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {upcomingCars.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No upcoming cars found.
                    </td>
                  </tr>
                )}
                {upcomingCars.map((car) => (
                  <tr key={car.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{car.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {car.brand.name}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {car.expectedLaunch || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {car.estimatedPrice || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/content/upcoming/${car.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only md:not-sr-only md:ml-1">
                              Edit
                            </span>
                          </Link>
                        </Button>
                        <DeleteUpcomingButton upcomingCarId={car.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Hero Slider tab ───────────────────────────────────── */}
        <TabsContent value="hero" className="space-y-4">
          <div className="flex items-center justify-end">
            <Button asChild>
              <Link href="/admin/content/hero/new">
                <Plus className="mr-1 h-4 w-4" /> Add slide
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Order</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {heroSlides.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No hero slides. Add one to show on the home page.
                    </td>
                  </tr>
                )}
                {heroSlides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{slide.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{slide.sortOrder}</td>
                    <td className="px-4 py-3">
                      {slide.active ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/content/hero/${slide.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only md:not-sr-only md:ml-1">Edit</span>
                          </Link>
                        </Button>
                        <DeleteHeroSlideButton slideId={slide.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
