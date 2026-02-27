import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

type UserRole = "BUYER" | "DEALER" | "ADMIN";

const protectedPrefixes = ["/dealer", "/admin"];

function isProtected(pathname: string) {
  return protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

const edgeAuth = NextAuth(authConfig);

export default edgeAuth.auth((req) => {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  if (!req.auth?.user) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = (req.auth.user as { role?: UserRole }).role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/access-denied", req.nextUrl.origin));
  }
  if (pathname.startsWith("/dealer") && role !== "DEALER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/access-denied", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
