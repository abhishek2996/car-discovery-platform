type UserRole = import("../generated/prisma").UserRole;

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    dealerId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      dealerId?: string | null;
    };
  }
}

// NextAuth v4 uses `next-auth/jwt`; Auth.js/NextAuth v5 uses `@auth/core/jwt`.
// Declaring both keeps types working across versions and avoids build-time
// "invalid module name in augmentation" errors during deployment.
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    dealerId?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    dealerId?: string | null;
  }
}

export {};

