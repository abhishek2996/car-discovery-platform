import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

type UserRole = "BUYER" | "DEALER" | "ADMIN";

const publicPaths = ["/", "/login", "/access-denied", "/not-found"];
const dealerPathPrefix = "/dealer";
const adminPathPrefix = "/admin";

function isPublic(pathname: string) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isDealerRoute(pathname: string) {
  return pathname.startsWith(dealerPathPrefix);
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith(adminPathPrefix);
}

const edgeAuth = NextAuth(authConfig);

export default edgeAuth.auth((req) => {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();
  if (!req.auth?.user) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }
  const role = (req.auth.user as { role?: UserRole }).role;
  if (isAdminRoute(pathname) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/access-denied", req.nextUrl.origin));
  }
  if (isDealerRoute(pathname) && role !== "DEALER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/access-denied", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
