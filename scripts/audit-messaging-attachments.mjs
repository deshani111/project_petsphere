import "dotenv/config";
import { del, list } from "@vercel/blob";
import { prisma } from "../lib/prisma.js";

const token = process.env.MESSAGING_BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error("Set MESSAGING_BLOB_READ_WRITE_TOKEN for the private messaging store.");

const remove = process.argv.includes("--delete");
const cutoff = Date.now() - 24 * 60 * 60 * 1000;
let cursor;
let total = 0;
try {
  // Verify the messaging migration and DB connection before touching storage.
  await prisma.message_attachment.count();
  do {
    const page = await list({ token, prefix: "messages/", cursor, limit: 100 });
    const eligible = page.blobs.filter((blob) => +blob.uploadedAt < cutoff &&
      /^messages\/[1-9]\d*\/[a-f0-9-]{36}$/i.test(blob.pathname));
    if (eligible.length) {
      const referenced = await prisma.message_attachment.findMany({
        where: { storage_key: { in: eligible.map((blob) => blob.pathname) } },
        select: { storage_key: true },
      });
      const keys = new Set(referenced.map((item) => item.storage_key));
      const unused = eligible.filter((blob) => !keys.has(blob.pathname)).map((blob) => blob.pathname);
      total += unused.length;
      for (const key of unused) console.log(key);
      if (remove && unused.length) await del(unused, { token });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  console.log(remove ? "Removed " + total + " unreferenced files." : total + " unreferenced files; no changes made.");
} finally {
  await prisma.$disconnect();
}

