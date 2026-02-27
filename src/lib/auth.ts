import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  dealerId?: string | null;
};

/**
 * Get the current session. Returns null if not authenticated.
 */
export async function getSession() {
  return auth();
}

/**
 * Require an authenticated user. Redirects to /login if not signed in.
 * Use in server components, server actions, and route handlers.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user as SessionUser;
}

/**
 * Require the current user to have one of the given roles.
 * Redirects to /login if not signed in, or /access-denied if role not allowed.
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[]
): Promise<SessionUser> {
  const user = await requireUser();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) redirect("/access-denied");
  return user;
}

/**
 * Require admin role. Shortcut for requireRole("ADMIN").
 */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("ADMIN");
}

/**
 * Require dealer role (and optionally that the dealer is active).
 * Redirects to /access-denied if not a dealer.
 */
export async function requireDealer(): Promise<SessionUser> {
  const user = await requireRole("DEALER");
  if (!user.dealerId) redirect("/access-denied");
  return user;
}

/**
 * Enforce RBAC: only the owning dealer or an admin can access a resource.
 * Use in server actions and route handlers that are scoped by dealerId.
 * Redirects to /access-denied if the current user is not allowed.
 */
export async function assertDealerAccess(dealerId: string): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;
  if (user.role === "DEALER" && user.dealerId === dealerId) return user;
  redirect("/access-denied");
}
