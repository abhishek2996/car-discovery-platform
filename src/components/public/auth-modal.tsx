"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
}

export function AuthModal({ open, onOpenChange, callbackUrl = "/" }: AuthModalProps) {
  const signInUrl = callbackUrl ? `/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}` : "/sign-in";
  const signUpUrl = callbackUrl ? `/sign-up?redirect_url=${encodeURIComponent(callbackUrl)}` : "/sign-up";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in or create an account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button asChild className="w-full">
            <Link href={signInUrl} onClick={() => onOpenChange(false)}>
              Sign in
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={signUpUrl} onClick={() => onOpenChange(false)}>
              Create account
            </Link>
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground pt-2">
          <Link href="/" className="underline hover:text-foreground" onClick={() => onOpenChange(false)}>
            Back to home
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
