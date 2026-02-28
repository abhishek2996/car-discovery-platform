import Link from "next/link";
import { Calendar, User, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchArticles } from "@/lib/data/content";
import { PaginationControls } from "@/components/public/pagination-controls";
import { ReviewsFilters } from "@/components/public/reviews-filters";

export const metadata = {
  title: "News & Expert Reviews | CarDiscovery",
  description: "Read the latest car news, expert reviews, and automotive features from CarDiscovery.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TYPE_LABELS: Record<string, string> = {
  NEWS: "News",
  EXPERT_REVIEW: "Expert Review",
  FEATURE: "Feature",
  COMPARISON: "Comparison",
};

export default async function ReviewsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const type = typeof raw.type === "string" ? raw.type : undefined;
  const tag = typeof raw.tag === "string" ? raw.tag : undefined;
  const page = typeof raw.page === "string" ? Math.max(1, parseInt(raw.page, 10) || 1) : 1;

  const result = await searchArticles({ type, tag, page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">News & Reviews</h1>
        <p className="mt-1 text-muted-foreground">
          {result.total} {result.total === 1 ? "article" : "articles"}
        </p>
      </div>

      <ReviewsFilters />

      {result.articles.length > 0 ? (
        <>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.articles.map((article) => {
              const tags = article.tags
                ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [];

              return (
                <Link key={article.id} href={`/reviews/${article.slug}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                    {article.heroMediaUrl ? (
                      <div className="relative aspect-[16/9] bg-muted">
                        <img
                          src={article.heroMediaUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge variant="secondary" className="absolute right-2 top-2 text-[10px]">
                          {TYPE_LABELS[article.type] ?? article.type}
                        </Badge>
                      </div>
                    ) : (
                      <div className="relative flex aspect-[16/9] items-center justify-center bg-muted">
                        <FileText className="size-10 text-muted-foreground/30" />
                        <Badge variant="secondary" className="absolute right-2 top-2 text-[10px]">
                          {TYPE_LABELS[article.type] ?? article.type}
                        </Badge>
                      </div>
                    )}
                    <CardContent className="space-y-2 p-4">
                      <h3 className="text-base font-semibold leading-tight group-hover:text-primary line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {article.author?.name && (
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {article.author.name}
                          </span>
                        )}
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <PaginationControls page={result.page} totalPages={result.totalPages} total={result.total} />
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No articles found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
}
