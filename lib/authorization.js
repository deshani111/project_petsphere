import { NextResponse } from "next/server";
import { getCurrentSession } from "./session";

export const ROLES = Object.freeze({
  OWNER: "pet_owner",
  SITTER: "pet_sitter",
  ADMIN: "admin",
});

export function unauthorizedResponse(message = "Authentication required.") {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbiddenResponse(message = "You do not have permission to perform this action.") {
  return NextResponse.json({ message }, { status: 403 });
}

export async function requireAuthenticated() {
  return getCurrentSession();
}

export async function requireRole(role) {
  const session = await getCurrentSession();
  return session?.role === role ? session : null;
}

export async function requireAdmin() {
  const result = await authorizeAdmin();
  return result.session;
}

export async function authorizeAdmin() {
  const session = await getCurrentSession();
  if (!session) return { status: 401, session: null };
  if (!isAdminSession(session)) return { status: 403, session: null };
  return { status: 200, session };
}

export function isAdminSession(session) {
  return Boolean(
    session?.role === ROLES.ADMIN
    && session.hasAdminProfile
    && session.isVerified,
  );
}
