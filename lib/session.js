import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../modules/auth/auth.service";

// Reads and verifies the session cookie. Works in both Server Components
// and Route Handlers (next/headers cookies() is available in both).
export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  return payload; // { sub: "user_id string", role, exp } or null if invalid/expired
}

// Returns the logged-in pet_owner's owner_id, or null if not logged in /
// not an owner / no pet_owner row exists.
export async function getCurrentOwnerId() {
  const session = await getCurrentSession();
  if (!session || session.role !== "pet_owner") return null;

  const petOwner = await prisma.pet_owner.findUnique({
    where: { user_id: BigInt(session.sub) },
    select: { owner_id: true },
  });

  return petOwner ? petOwner.owner_id : null;
}