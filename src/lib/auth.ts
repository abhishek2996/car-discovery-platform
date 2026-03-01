import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/roles";
import type { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/db";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  dealerId?: string | null;
};

export async function getSession() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  if (!user) return null;
  const role = await getUserRole(userId);
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { dealer: { select: { id: true } } },
  });
  return {
    user: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      image: user.imageUrl ?? null,
      role,
      dealerId: dbUser?.dealer?.id ?? null,
    },
  };
}

export async function requireUser(): Promise<SessionUser> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const role = await getUserRole(userId);
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { dealer: { select: { id: true } } },
  });
  return {
    id: userId,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    image: user.imageUrl ?? null,
    role,
    dealerId: dbUser?.dealer?.id ?? null,
  };
}

export async function requireRole(allowedRoles: UserRole | UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) redirect("/unauthorised");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("ADMIN");
}

export async function requireDealer(): Promise<SessionUser> {
  const user = await requireRole(["DEALER", "ADMIN"]);
  if (user.role === "DEALER" && !user.dealerId) redirect("/unauthorised");
  return user;
}

export async function assertDealerAccess(dealerId: string): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;
  if (user.role === "DEALER" && user.dealerId === dealerId) return user;
  redirect("/unauthorised");
}
