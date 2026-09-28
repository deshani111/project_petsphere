import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

async function verifyAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be provided.");
  }

  const user = await prisma.users.findUnique({
    where: { email },
    select: { role: true, password_hash: true },
  });

  if (!user) {
    console.log("Admin account exists: no");
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  console.log("Admin account exists: yes");
  console.log(`Admin role: ${user.role}`);
  console.log(`Password matches: ${passwordMatches ? "yes" : "no"}`);
}

verifyAdmin()
  .catch((error) => {
    console.error("Admin verification failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
