import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteFromR2, getKeyFromR2Url } from "@/lib/r2";

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const role = session.user.role;
    if (role !== "DEALER" && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: DEALER or ADMIN only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const url = searchParams.get("url");

    let deleteKey: string | null = key;
    if (!deleteKey && url) {
      deleteKey = getKeyFromR2Url(url);
    }
    if (!deleteKey) {
      // External URL (not from R2) – nothing to delete, treat as success
      return NextResponse.json({ success: true });
    }

    await deleteFromR2(deleteKey);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[upload delete]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 }
    );
  }
}
