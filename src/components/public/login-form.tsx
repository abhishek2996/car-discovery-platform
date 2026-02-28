"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <>
      {state.error && (
        <p className="text-sm text-destructive text-center">{state.error}</p>
      )}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </>
  );
}
