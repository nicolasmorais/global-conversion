import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
});

export const R2_BUCKET = process.env.S3_BUCKET || "onenotion";
