import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/lib/db";

// Ensure Clerk can reach this URL (e.g. https://your-domain.com/api/webhooks/clerk)
// and that in Clerk Dashboard → Webhooks you subscribe to: user.created, user.updated, user.deleted.
// Set CLERK_WEBHOOK_SIGNING_SECRET (or CLERK_WEBHOOK_SECRET) to the endpoint's signing secret.

export async function POST(request: Request) {
  const secret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/clerk] Missing CLERK_WEBHOOK_SIGNING_SECRET (or CLERK_WEBHOOK_SECRET)");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const evt = await verifyWebhook(request as never, { signingSecret: secret });
    const { type, data } = evt;

    if (type === "user.created") {
      const id = data.id;
      const payload = data as {
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
      const primaryEmail = payload.email_addresses?.find(
        (e) => e.id === payload.primary_email_address_id
      );
      const email =
        primaryEmail?.email_address ??
        payload.email_addresses?.[0]?.email_address ??
        "";
      const name = [payload.first_name, payload.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || null;
      const image = payload.image_url ?? null;

      if (!email) {
        console.warn("[webhooks/clerk] user.created missing email, skipping", id);
        return NextResponse.json({ received: true });
      }

      try {
        await prisma.user.upsert({
          where: { id },
          create: {
            id,
            email,
            name,
            image,
            role: "BUYER",
          },
          update: {},
        });
        console.log("[webhooks/clerk] user.created synced to DB", id, email);
      } catch (dbErr: unknown) {
        const prismaErr = dbErr as { code?: string; meta?: { target?: string[] } };
        if (
          prismaErr.code === "P2002" &&
          Array.isArray(prismaErr.meta?.target) &&
          prismaErr.meta.target.includes("email")
        ) {
          // Row already exists with this email (seed/legacy or duplicate Clerk). Reassign that row to this Clerk id.
          try {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (!existing) return NextResponse.json({ received: true });
            if (existing.id === id) {
              console.log("[webhooks/clerk] user.created duplicate delivery, already synced", id);
              return NextResponse.json({ received: true });
            }
            const oldId = existing.id;
            await prisma.$transaction([
              prisma.account.updateMany({ where: { userId: oldId }, data: { userId: id } }),
              prisma.session.updateMany({ where: { userId: oldId }, data: { userId: id } }),
              prisma.dealer.updateMany({ where: { userId: oldId }, data: { userId: id } }),
              prisma.lead.updateMany({ where: { buyerId: oldId }, data: { buyerId: id } }),
              prisma.testDriveSlot.updateMany({ where: { buyerId: oldId }, data: { buyerId: id } }),
              prisma.savedComparison.updateMany({ where: { userId: oldId }, data: { userId: id } }),
              prisma.savedSearch.updateMany({ where: { userId: oldId }, data: { userId: id } }),
              prisma.review.updateMany({ where: { userId: oldId }, data: { userId: id } }),
              prisma.contentArticle.updateMany({
                where: { authorId: oldId },
                data: { authorId: id },
              }),
              prisma.user.update({
                where: { email },
                data: { id, name, image },
              }),
            ]);
            console.log("[webhooks/clerk] user.created claimed existing row by email", id, email);
          } catch (claimErr) {
            console.error("[webhooks/clerk] user.created claim-by-email failed", id, email, claimErr);
            return NextResponse.json(
              { error: "Database sync failed" },
              { status: 500 }
            );
          }
        } else {
          console.error("[webhooks/clerk] user.created DB error", id, dbErr);
          return NextResponse.json(
            { error: "Database sync failed" },
            { status: 500 }
          );
        }
      }
      return NextResponse.json({ received: true });
    }

    if (type === "user.updated") {
      const id = data.id;
      const d = data as {
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
      const primaryEmail = d.email_addresses?.find(
        (e) => e.id === d.primary_email_address_id
      );
      const email = primaryEmail?.email_address ?? d.email_addresses?.[0]?.email_address;
      const name = [d.first_name, d.last_name].filter(Boolean).join(" ").trim() || null;
      const image = d.image_url ?? null;

      try {
        await prisma.user.updateMany({
          where: { id },
          data: {
            ...(email && { email }),
            ...(name !== undefined && { name }),
            ...(image !== undefined && { image }),
          },
        });
      } catch (dbErr) {
        console.error("[webhooks/clerk] user.updated DB error", id, dbErr);
        return NextResponse.json(
          { error: "Database sync failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ received: true });
    }

    if (type === "user.deleted") {
      const id = (data as { id?: string }).id;
      if (!id) return NextResponse.json({ received: true });
      try {
        await prisma.user.updateMany({
          where: { id },
          data: {
            email: `deleted-${id}@deleted.local`,
            name: null,
            image: null,
          },
        });
      } catch (dbErr) {
        console.error("[webhooks/clerk] user.deleted DB error", id, dbErr);
        return NextResponse.json(
          { error: "Database sync failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhooks/clerk] verification or handling failed", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }
}
