import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const secret =
    process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    console.error("[webhooks/clerk] Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    // App Router passes Web API Request; Clerk's verifyWebhook accepts it at runtime (types expect NextRequest)
    const evt = await verifyWebhook(request as never, { signingSecret: secret });
    const { type, data } = evt;

    if (type === "user.created") {
      const id = data.id;
      const primaryEmail = (data as { email_addresses?: Array<{ id: string; email_address: string }>; primary_email_address_id?: string }).email_addresses?.find(
        (e) => e.id === (data as { primary_email_address_id?: string }).primary_email_address_id
      );
      const email = primaryEmail?.email_address ?? (data as { email_addresses?: Array<{ email_address: string }> }).email_addresses?.[0]?.email_address ?? "";
      const name = [(data as { first_name?: string }).first_name, (data as { last_name?: string }).last_name].filter(Boolean).join(" ") || null;
      const image = (data as { image_url?: string }).image_url ?? null;

      if (!email) {
        console.warn("[webhooks/clerk] user.created missing email", id);
        return NextResponse.json({ received: true });
      }

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
      return NextResponse.json({ received: true });
    }

    if (type === "user.updated") {
      const id = data.id;
      const d = data as { email_addresses?: Array<{ id: string; email_address: string }>; primary_email_address_id?: string; first_name?: string; last_name?: string; image_url?: string };
      const primaryEmail = d.email_addresses?.find((e) => e.id === d.primary_email_address_id);
      const email = primaryEmail?.email_address ?? d.email_addresses?.[0]?.email_address;
      const name = [d.first_name, d.last_name].filter(Boolean).join(" ") || null;
      const image = d.image_url ?? null;

      await prisma.user.updateMany({
        where: { id },
        data: {
          ...(email && { email }),
          ...(name !== undefined && { name }),
          ...(image !== undefined && { image }),
        },
      });
      return NextResponse.json({ received: true });
    }

    if (type === "user.deleted") {
      const id = (data as { id?: string }).id;
      if (!id) return NextResponse.json({ received: true });
      await prisma.user.updateMany({
        where: { id },
        data: { email: `deleted-${id}@deleted.local`, name: null, image: null },
      });
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhooks/clerk]", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }
}
