import { exec } from "child_process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

async function backup() {
  const date = new Date().toISOString().split("T")[0];
  const filename = `pbi-backup-${date}.sql`;

  await new Promise<void>((res, rej) =>
    exec(`mysqldump ${process.env.DATABASE_URL} > /tmp/${filename}`, (err) =>
      err ? rej(err) : res()
    )
  );

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BACKUP_BUCKET!,
    Key: `backups/${filename}`,
    Body: readFileSync(`/tmp/${filename}`),
  }));

  console.log(`Backup uploaded: ${filename}`);
}

backup().catch(console.error);
