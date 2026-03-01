import type { UserRole } from "@/generated/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function getUserRole(userId: string): Promise<UserRole> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role === "DEALER" || role === "ADMIN" || role === "BUYER") return role;
  return "BUYER";
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}

export async function isDealer(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "DEALER" || role === "ADMIN";
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "ADMIN";
}
