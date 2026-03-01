import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function getExt(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File too large. Max size 5MB." },
        { status: 400 }
      );
    }

    const ext = getExt(file.type);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { url, key } = await uploadToR2(buffer, folder, filename);

    return NextResponse.json({ success: true, url, key });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
