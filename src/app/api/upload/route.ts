import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_SIZE_IMAGE = 5 * 1024 * 1024; // 5MB
const MAX_SIZE_VIDEO = 50 * 1024 * 1024; // 50MB

function getExt(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
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
          error: `Invalid file type. Allowed: images (JPEG, PNG, WebP) and videos (MP4, WebM). Max image 5MB, max video 50MB.`,
        },
        { status: 400 }
      );
    }

    const maxSize = ALLOWED_VIDEO_TYPES.includes(file.type) ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error:
            file.type.startsWith("video/")
              ? "Video too large. Max size 50MB."
              : "File too large. Max size 5MB.",
        },
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
