import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ExpertReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  author: { id: string; name: string | null; image: string | null } | null;
  carVariant: { id: string; name: string } | null;
  createdAt: Date;
}

interface ExpertReviewSummaryProps {
  reviews: ExpertReview[];
}

export function ExpertReviewSummary({ reviews }: ExpertReviewSummaryProps) {
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expert Reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {reviews.length} expert {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-5 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <p className="mt-0.5 text-sm font-semibold">{avgRating.toFixed(1)} / 5</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={review.author?.image ?? undefined} />
                  <AvatarFallback>
                    {review.author?.name?.charAt(0) ?? "E"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {review.author?.name ?? "Expert Reviewer"}
                      </p>
                      {review.carVariant && (
                        <p className="text-xs text-muted-foreground">
                          Reviewed: {review.carVariant.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="mt-2 text-sm font-semibold">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {review.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
