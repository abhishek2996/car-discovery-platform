import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/generated/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any) as any,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { dealer: true },
        });
        if (!user || !user.password) return null;
        const ok = await compare(String(credentials.password), user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          dealerId: user.dealer?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.dealerId = user.dealerId ?? null;
      }
      if (trigger === "update" && session?.user) {
        token.role = (session.user as { role?: UserRole }).role ?? token.role;
        token.dealerId =
          (session.user as { dealerId?: string | null }).dealerId ?? token.dealerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.dealerId = token.dealerId ?? undefined;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials" && user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { dealer: true },
        });
        if (dbUser?.dealer) (user as { dealerId?: string }).dealerId = dbUser.dealer.id;
      }
    },
  },
});
