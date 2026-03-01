/**
 * Cloudflare R2 (S3-compatible) client and utilities.
 * Set env: CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,
 * CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_PUBLIC_URL
 */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, ""); // no trailing slash

function getClient(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 credentials: CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY"
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export type UploadResult = { url: string; key: string };

/**
 * Upload a file buffer to R2 and return the public CDN URL.
 * @param file - Buffer or Uint8Array of file content
 * @param folder - R2 prefix/folder (e.g. "cars", "dealers", "brands")
 * @param filename - Filename including extension (will be used as object key under folder)
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  folder: string,
  filename: string
): Promise<UploadResult> {
  const client = getClient();
  if (!bucketName || !publicUrl) {
    throw new Error(
      "Missing R2 config: CLOUDFLARE_R2_BUCKET_NAME, CLOUDFLARE_R2_PUBLIC_URL"
    );
  }
  const key = `${folder.replace(/^\/|\/$/g, "")}/${filename}`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: getContentType(filename),
    })
  );
  const url = `${publicUrl}/${key}`;
  return { url, key };
}

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

/**
 * Delete a file from R2 by its key.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  if (!bucketName) {
    throw new Error("Missing CLOUDFLARE_R2_BUCKET_NAME");
  }
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

/**
 * Return the full public CDN URL for a given R2 key.
 */
export function getR2Url(key: string): string {
  if (!publicUrl) {
    throw new Error("Missing CLOUDFLARE_R2_PUBLIC_URL");
  }
  const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
  return `${publicUrl}/${normalizedKey}`;
}

/**
 * Parse an R2 public URL back to the object key (without leading slash).
 * Returns null if the URL is not from our R2 public URL.
 */
export function getKeyFromR2Url(url: string): string | null {
  if (!publicUrl || !url.startsWith(publicUrl + "/")) {
    return null;
  }
  return url.slice(publicUrl.length + 1);
}
