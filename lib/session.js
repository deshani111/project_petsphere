import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import {
  SESSION_COOKIE_NAME,
  getCachedSessionAccount,
  verifySessionToken,
} from "../modules/auth/auth.service";

/**
 * Reads and verifies the current session cookie.
 *
 * @returns {Promise<{ sub: string, role: string, exp: number } | null>}
 */
async function getCurrentSessionImpl() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = verifySessionToken(token);
  if (!session) return null;

  const account = await getCachedSessionAccount(token);
  if (!account) return null;

  return { sub: account.id, role: account.role, exp: session.exp };
}

export const getCurrentSession = cache(getCurrentSessionImpl);

/**
 * Returns the current pet owner's owner_id.
 * Returns null when:
 * - there is no valid session
 * - the logged-in user is not a pet owner
 * - the pet_owner record does not exist
 */
export async function getCurrentOwnerId() {
  const session = await getCurrentSession();

  if (!session || session.role !== "pet_owner") {
    return null;
  }

  const petOwner = await prisma.pet_owner.findUnique({
    where: {
      user_id: BigInt(session.sub),
    },
    select: {
      owner_id: true,
    },
  });

  return petOwner?.owner_id ?? null;
}
