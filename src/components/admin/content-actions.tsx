"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import {
  toggleArticlePublish,
  deleteArticle,
  deleteUpcomingCar,
} from "@/lib/actions/admin";
import { toast } from "sonner";

export function PublishToggleButton({
  articleId,
  isPublished,
}: {
  articleId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleArticlePublish(articleId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPublished ? (
        <EyeOff className="h-3.5 w-3.5" />
      ) : (
        <Eye className="h-3.5 w-3.5" />
      )}
      <span className="sr-only md:not-sr-only md:ml-1">
        {isPublished ? "Unpublish" : "Publish"}
      </span>
    </Button>
  );
}

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setConfirming(false);
    });
  }

  return (
    <Button
      size="sm"
      variant={confirming ? "destructive" : "ghost"}
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span className="sr-only md:not-sr-only md:ml-1">
        {confirming ? "Confirm" : "Delete"}
      </span>
    </Button>
  );
}

export function DeleteUpcomingButton({
  upcomingCarId,
}: {
  upcomingCarId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteUpcomingCar(upcomingCarId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setConfirming(false);
    });
  }

  return (
    <Button
      size="sm"
      variant={confirming ? "destructive" : "ghost"}
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span className="sr-only md:not-sr-only md:ml-1">
        {confirming ? "Confirm" : "Delete"}
      </span>
    </Button>
  );
}
