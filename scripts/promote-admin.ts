/**
 * One-time bootstrap: promote a user to ADMIN by email.
 * Sets role in both Clerk (publicMetadata) and Prisma so the app treats them as admin.
 *
 * Usage: npx tsx scripts/promote-admin.ts <email>
 * Example: npx tsx scripts/promote-admin.ts abhishek.mandlik@hotmail.com
 *
 * Requires: .env with CLERK_SECRET_KEY and DATABASE_URL.
 */

import "dotenv/config";
import { createClerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const email = process.argv[2]?.trim()?.toLowerCase();
if (!email) {
  console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
  process.exit(1);
}

async function main() {
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!clerkSecret) {
    console.error("Missing CLERK_SECRET_KEY in .env");
    process.exit(1);
  }

  const clerk = createClerkClient({ secretKey: clerkSecret });

  // Find user in Clerk by email
  const { data: clerkUsers } = await clerk.users.getUserList({
    emailAddress: [email],
  });
  const clerkUser = clerkUsers?.find((u) =>
    u.emailAddresses?.some((e) => e.emailAddress?.toLowerCase() === email)
  );
  if (!clerkUser) {
    console.error(`No Clerk user found with email: ${email}`);
    process.exit(1);
  }

  const userId = clerkUser.id;
  console.log(
    `Found Clerk user: ${clerkUser.firstName} ${clerkUser.lastName} (${email}), id: ${userId}`
  );

  // Set role in Clerk publicMetadata
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { ...clerkUser.publicMetadata, role: "ADMIN" },
  });
  console.log("Updated Clerk publicMetadata.role to ADMIN");

  // Set role in Prisma (User.id = Clerk user id from webhook)
  const updated = await prisma.user.updateMany({
    where: { id: userId },
    data: { role: "ADMIN" },
  });
  if (updated.count === 0) {
    console.warn(
      "No matching user in database (webhook may not have run yet). Clerk role was still set; next sign-in may sync."
    );
  } else {
    console.log("Updated Prisma User.role to ADMIN");
  }

  console.log("Done. Sign out and sign in again, then open /admin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
