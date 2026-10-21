import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";

const ROLES = new Set(["pet_owner", "pet_sitter"]);
const STATUSES = new Set(["active", "pending", "suspended"]);
const SORTS = { joined: { created_at: "desc" }, name: { first_name: "asc" } };
const select = { user_id: true, first_name: true, last_name: true, full_name: true, email: true, phone_number: true, role: true, is_verified: true, account_status: true, created_at: true, updated_at: true };

export function parseAdminUserId(value) { try { const id = BigInt(value); return id > 0n ? id : null; } catch { return null; } }
function statusOf(user) { return user.account_status === "suspended" ? "suspended" : user.is_verified ? "active" : "pending"; }
function mapUser(user) { return { id: `USR-${user.user_id}`, userId: String(user.user_id), name: `${user.first_name} ${user.last_name}`.trim() || user.full_name || "Unknown user", email: user.email, phoneNumber: user.phone_number || "", role: user.role === "pet_sitter" ? "sitter" : "pet_owner", joined: user.created_at.toISOString(), status: statusOf(user), isVerified: user.is_verified }; }

export async function listAdminUsers({ page = 1, pageSize = 8, search = "", role = "all", status = "all", sort = "joined" } = {}) {
  page = Math.max(1, Number(page) || 1); pageSize = Math.min(100, Math.max(1, Number(pageSize) || 8));
  const where = { role: { in: [...ROLES] } };
  if (role !== "all" && ROLES.has(role === "sitter" ? "pet_sitter" : role)) where.role = role === "sitter" ? "pet_sitter" : role;
  if (status === "suspended") where.account_status = "suspended";
  if (status === "active") { where.account_status = "active"; where.is_verified = true; }
  if (status === "pending") { where.account_status = "active"; where.is_verified = false; }
  const value = String(search).trim(); if (value) where.OR = [{ first_name: { contains: value, mode: "insensitive" } }, { last_name: { contains: value, mode: "insensitive" } }, { full_name: { contains: value, mode: "insensitive" } }, { email: { contains: value, mode: "insensitive" } }];
  const [total, rows] = await Promise.all([prisma.users.count({ where }), prisma.users.findMany({ where, select, orderBy: SORTS[sort] || SORTS.joined, skip: (page - 1) * pageSize, take: pageSize })]);
  return { users: rows.map(mapUser), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
export async function getAdminUser(id) { const user = await prisma.users.findFirst({ where: { user_id: id, role: { in: [...ROLES] } }, select }); return user ? mapUser(user) : null; }
export async function updateAdminUser(id, input) {
  if (!await getAdminUser(id)) return null; const data = {};
  if (input.name !== undefined) { const parts = String(input.name).trim().replace(/\s+/g, " ").split(" "); if (!parts[0] || String(input.name).trim().length > 200) throw new Error("A valid name is required."); data.first_name = parts.shift(); data.last_name = parts.join(" ") || data.first_name; }
  if (input.phoneNumber !== undefined) { const phone = String(input.phoneNumber).trim(); if (phone && !/^[+0-9()\-\s]{8,20}$/.test(phone)) throw new Error("Please provide a valid phone number."); data.phone_number = phone || null; }
  if (input.status !== undefined) { if (!STATUSES.has(input.status)) throw new Error("Invalid account status."); data.account_status = input.status === "suspended" ? "suspended" : "active"; }
  if (!Object.keys(data).length) throw new Error("No supported changes were supplied."); const user = await prisma.users.update({ where: { user_id: id }, data: { ...data, updated_at: new Date() }, select }); return mapUser(user);
}
export async function deleteAdminUser(id) { if (!await getAdminUser(id)) return false; await prisma.users.delete({ where: { user_id: id } }); return true; }
export async function createAdminUser(input) {
  const name = String(input.name || "").trim().replace(/\s+/g, " "); const email = String(input.email || "").trim().toLowerCase(); const phone = String(input.phoneNumber || "").trim(); const address = String(input.address || "").trim(); const password = String(input.password || ""); const role = input.role === "sitter" ? "pet_sitter" : input.role;
  if (!name || name.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ROLES.has(role) || password.length < 8 || !address) throw new Error("Please provide a name, valid email, role, address, and password of at least 8 characters.");
  if (phone && !/^[+0-9()\-\s]{8,20}$/.test(phone)) throw new Error("Please provide a valid phone number.");
  const parts = name.split(" "); const firstName = parts.shift(); const lastName = parts.join(" ") || firstName; const password_hash = await bcrypt.hash(password, 12);
  const created = await prisma.$transaction(async (tx) => { const user = await tx.users.create({ data: { first_name: firstName, last_name: lastName, email, phone_number: phone || null, password_hash, role, is_verified: false, emailVerified: false }, select }); if (role === "pet_owner") await tx.pet_owner.create({ data: { user_id: user.user_id, address } }); else await tx.pet_sitter.create({ data: { user_id: user.user_id, address } }); return user; });
  return mapUser(created);
}
