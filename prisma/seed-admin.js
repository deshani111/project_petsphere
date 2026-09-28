import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const ADMIN_ROLE = "admin";

function getRequiredEnvironmentValue(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be provided before running the admin seed.`);
  }

  return value;
}

async function seedAdmin() {
  const email = getRequiredEnvironmentValue("ADMIN_SEED_EMAIL").trim().toLowerCase();
  const password = getRequiredEnvironmentValue("ADMIN_SEED_PASSWORD");
  const existingUser = await prisma.users.findUnique({
    where: { email },
    select: { user_id: true },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  if (existingUser) {
    await prisma.$transaction([
      prisma.users.update({
        where: { user_id: existingUser.user_id },
        data: {
          role: ADMIN_ROLE,
          password_hash: passwordHash,
          is_verified: true,
        },
      }),
      prisma.admin.upsert({
        where: { user_id: existingUser.user_id },
        update: {},
        create: { user_id: existingUser.user_id },
      }),
    ]);
    console.log(`Existing account ${email} was updated for development admin login.`);
    return;
  }

  await prisma.$transaction(async (transaction) => {
    const adminUser = await transaction.users.create({
      data: {
        first_name: "Admin",
        last_name: "User",
        email,
        password_hash: passwordHash,
        role: ADMIN_ROLE,
        is_verified: true,
      },
      select: { user_id: true },
    });

    await transaction.admin.create({ data: { user_id: adminUser.user_id } });
  });

  console.log(`Admin account ${email} was created.`);
}

seedAdmin()
  .catch((error) => {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
