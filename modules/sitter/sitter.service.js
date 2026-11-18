import { prisma } from "../../lib/prisma";
import { requireRole, ROLES } from "../../lib/authorization";

export async function getCurrentSitter(options = {}) {
  const session = await requireRole(ROLES.SITTER);
  if (!session) return null;
  return prisma.pet_sitter.findUnique({
    where: { user_id: BigInt(session.sub) },
    include: { users: true },
    ...options,
  });
}

export function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item
  ));
}
