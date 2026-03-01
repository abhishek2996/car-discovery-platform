"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/public/login-form";
import { registerAction } from "@/lib/actions/auth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
}

export function AuthModal({ open, onOpenChange, callbackUrl = "/" }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <LoginForm callbackUrl={callbackUrl} />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <RegisterForm callbackUrl={callbackUrl} />
          </TabsContent>
        </Tabs>
        <p className="text-center text-sm text-muted-foreground pt-2">
          <Link href="/" className="underline hover:text-foreground" onClick={() => onOpenChange(false)}>
            Back to home
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}

function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(registerAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {state?.error && (
        <p className="text-sm text-destructive text-center">{state.error}</p>
      )}
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium mb-1">
          Name (optional)
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
        />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
        />
        <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
