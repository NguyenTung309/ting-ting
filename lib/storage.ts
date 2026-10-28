import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function s3Config() {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) return null;
  return { bucket: process.env.S3_BUCKET, client: new S3Client({ region: process.env.S3_REGION || "auto", endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: Boolean(process.env.S3_ENDPOINT), credentials: { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY } }) };
}

export function storageMode() { return s3Config() ? "s3" : "local"; }

export async function storageHealthy() {
  const config = s3Config();
  if (!config) return true;
  try { await config.client.send(new HeadBucketCommand({ Bucket: config.bucket })); return true; } catch { return false; }
}

export async function putPrivateObject(key: string, data: Uint8Array, contentType: string) {
  const config = s3Config();
  if (config) { await config.client.send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: data, ContentType: contentType })); return; }
  const filePath = path.join(process.cwd(), "uploads", key); await mkdir(path.dirname(filePath), { recursive: true }); await writeFile(filePath, data);
}

export async function getPrivateObject(key: string) {
  const config = s3Config();
  if (config) { const response = await config.client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key })); const body = response.Body ? await response.Body.transformToByteArray() : new Uint8Array(); return { data: Buffer.from(body), contentType: response.ContentType || "application/octet-stream" }; }
  const data = await readFile(path.join(process.cwd(), "uploads", key)); return { data, contentType: "application/octet-stream" };
}
