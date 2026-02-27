import type { NextAuthConfig } from "next-auth";

/** Role type matching Prisma UserRole - duplicated here so middleware doesn't depend on @prisma/client */
type UserRole = "BUYER" | "DEALER" | "ADMIN";

/**
 * Auth config without Prisma or credentials provider.
 * Used by middleware (Edge) so it never pulls in Prisma.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: UserRole }).role;
        token.dealerId = (user as { dealerId?: string | null }).dealerId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.dealerId = (token.dealerId as string | null) ?? undefined;
      }
      return session;
    },
  },
};
