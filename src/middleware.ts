import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login",
  "/cars/(.*)",
  "/new-cars(.*)",
  "/brands/(.*)",
  "/compare(.*)",
  "/upcoming(.*)",
  "/reviews(.*)",
  "/dealers(.*)",
  "/dealer-signup",
  "/api/webhooks/(.*)",
  "/unauthorised",
  "/access-denied",
]);

const isDealerRoute = createRouteMatcher(["/dealer", "/dealer/(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin", "/admin/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(req)) return NextResponse.next();

  if (isDealerRoute(req) || isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signIn = new URL("/sign-in", req.nextUrl.origin);
      signIn.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signIn);
    }
    // Role check is done in layout (requireDealer / requireAdmin) → redirect to /unauthorised
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
