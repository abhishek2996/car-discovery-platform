import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleStoryCardProps {
  title: string;
  slug: string;
  heroMediaUrl: string | null;
}

export function ArticleStoryCard({ title, slug, heroMediaUrl }: ArticleStoryCardProps) {
  return (
    <Link href={`/reviews/${slug}`} className="block shrink-0 w-[260px] sm:w-[280px]">
      <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        <div className="relative aspect-[4/3] bg-muted">
          {heroMediaUrl ? (
            <img
              src={heroMediaUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileText className="size-10 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary">
            {title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
