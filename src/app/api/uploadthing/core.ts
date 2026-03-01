import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

type FileData = { url: string; key: string; name: string; size: number };

async function authMiddleware() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return { userId: session.user.id, role: (session.user as { role?: string }).role };
}

export const uploadRouter = {
  carImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(({ metadata, file }) => {
      const f = file as unknown as FileData;
      console.log("[upload] carImage by", metadata.userId, f.url);
      return { url: f.url };
    }),

  dealerMedia: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      const role = (session.user as { role?: string }).role;
      if (role !== "DEALER" && role !== "ADMIN") throw new Error("Forbidden");
      return { userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      const f = file as unknown as FileData;
      console.log("[upload] dealerMedia by", metadata.userId, f.url);
      return { url: f.url };
    }),

  articleHero: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      const role = (session.user as { role?: string }).role;
      if (role !== "ADMIN") throw new Error("Forbidden");
      return { userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      const f = file as unknown as FileData;
      console.log("[upload] articleHero by", metadata.userId, f.url);
      return { url: f.url };
    }),

  brandLogo: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      const role = (session.user as { role?: string }).role;
      if (role !== "ADMIN") throw new Error("Forbidden");
      return { userId: session.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      const f = file as unknown as FileData;
      console.log("[upload] brandLogo by", metadata.userId, f.url);
      return { url: f.url };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;
