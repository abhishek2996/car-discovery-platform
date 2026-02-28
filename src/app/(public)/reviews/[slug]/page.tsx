import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ChevronRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/content";

type PageParams = Promise<{ slug: string }>;

const TYPE_LABELS: Record<string, string> = {
  NEWS: "News",
  EXPERT_REVIEW: "Expert Review",
  FEATURE: "Feature",
  COMPARISON: "Comparison",
};

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} | CarDiscovery`,
    description: article.body?.slice(0, 160) ?? article.title,
  };
}

export default async function ArticleDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.tags);
  const tags = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/reviews" className="hover:text-foreground">News & Reviews</Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground line-clamp-1">{article.title}</span>
      </nav>

      {/* Hero image */}
      {article.heroMediaUrl && (
        <img
          src={article.heroMediaUrl}
          alt={article.title}
          className="mb-6 aspect-[2/1] w-full rounded-xl object-cover"
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-3">{TYPE_LABELS[article.type] ?? article.type}</Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          {article.author && (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={article.author.image ?? undefined} />
                <AvatarFallback>{article.author.name?.charAt(0) ?? "A"}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{article.author.name}</span>
            </div>
          )}
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/reviews?tag=${encodeURIComponent(t)}`}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {article.body && (
        <div className="prose prose-slate max-w-none">
          {article.body.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mt-16 border-t pt-8">
          <h2 className="mb-6 text-xl font-bold">Related Articles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} href={`/reviews/${r.slug}`}>
                <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="flex gap-4 p-4">
                    {r.heroMediaUrl && (
                      <img
                        src={r.heroMediaUrl}
                        alt={r.title}
                        className="size-20 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <Badge variant="outline" className="mb-1 text-[10px]">
                        {TYPE_LABELS[r.type] ?? r.type}
                      </Badge>
                      <h3 className="text-sm font-semibold leading-tight group-hover:text-primary line-clamp-2">
                        {r.title}
                      </h3>
                      {r.publishedAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(r.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to News & Reviews
        </Link>
      </div>
    </div>
  );
}
