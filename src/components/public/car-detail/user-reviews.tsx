"use client";

import { useState, useActionState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { submitReview } from "@/lib/actions/leads";
import type { ActionResult } from "@/lib/types";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  variantName: string;
  author: { id: string; name: string | null; image: string | null } | null;
  createdAt: Date;
}

interface UserReviewsProps {
  reviews: Review[];
  variants: { id: string; name: string }[];
  avgRating: number | null;
  totalCount: number;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "size-5" : "size-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewForm({ variants }: { variants: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100">
          <Star className="size-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Thank you!</h3>
        <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div>
        <Label>Select Variant</Label>
        <Select name="carVariantId" required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose variant" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.carVariantId && (
          <p className="mt-1 text-xs text-destructive">{state.errors.carVariantId[0]}</p>
        )}
      </div>

      <div>
        <Label>Rating</Label>
        <input type="hidden" name="rating" value={rating} />
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredStar(i + 1)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(i + 1)}
              className="p-0.5"
            >
              <Star
                className={`size-7 transition-colors ${
                  i < (hoveredStar || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">{rating} / 5</span>
          )}
        </div>
        {state?.errors?.rating && (
          <p className="mt-1 text-xs text-destructive">{state.errors.rating[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="review-title">Title</Label>
        <Input id="review-title" name="title" placeholder="Summarise your experience" className="mt-1" />
        {state?.errors?.title && (
          <p className="mt-1 text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="review-content">Your Review</Label>
        <Textarea
          id="review-content"
          name="content"
          placeholder="Share your experience with this car..."
          rows={4}
          className="mt-1"
        />
        {state?.errors?.content && (
          <p className="mt-1 text-xs text-destructive">{state.errors.content[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending || rating === 0} className="w-full">
        {pending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}

export function UserReviews({ reviews, variants, avgRating, totalCount }: UserReviewsProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Reviews</h2>
          <div className="mt-1 flex items-center gap-3">
            {avgRating !== null && (
              <>
                <StarRating rating={Math.round(avgRating)} size="md" />
                <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
              </>
            )}
            <span className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="mr-2 size-4" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <ReviewForm variants={variants} />
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 text-center py-12 rounded-lg border bg-muted/30">
          <MessageSquare className="mx-auto size-10 text-muted-foreground/30" />
          <h3 className="mt-3 text-sm font-semibold">No reviews yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={review.author?.image ?? undefined} />
                    <AvatarFallback>
                      {review.author?.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {review.author?.name ?? "Anonymous"}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.variantName} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {review.title && (
                      <h4 className="mt-2 text-sm font-semibold">{review.title}</h4>
                    )}
                    {review.content && (
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {review.content}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
