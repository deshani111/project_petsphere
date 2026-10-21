import { prisma } from "../../lib/prisma";

export async function listPendingVerifications({ search = "", status = "all", sort = "newest" } = {}) {
  const value = String(search).trim();
  const where = { is_verified: false };
  if (value) where.users = { OR: [{ first_name: { contains: value, mode: "insensitive" } }, { last_name: { contains: value, mode: "insensitive" } }, { email: { contains: value, mode: "insensitive" } }] };
  const rows = await prisma.pet_sitter.findMany({ where, include: { users: { select: { user_id: true, first_name: true, last_name: true, email: true, created_at: true } }, verification_documents: { orderBy: { submitted_at: "desc" }, select: { document_id: true, document_type: true, file_url: true, submitted_at: true } } }, orderBy: { users: { created_at: sort === "oldest" ? "asc" : "desc" } } });
  return rows.map((sitter) => { const document = sitter.verification_documents[0]; const applied = document?.submitted_at || sitter.users.created_at; return { id: sitter.users.user_id.toString(), sitterId: sitter.sitter_id.toString(), name: `${sitter.users.first_name} ${sitter.users.last_name}`.trim(), email: sitter.users.email, applied: applied.toISOString(), status: document ? "in_review" : "pending", documents: sitter.verification_documents.map((item) => ({ id: item.document_id.toString(), type: item.document_type, url: item.file_url, submittedAt: item.submitted_at.toISOString() })) }; }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : 0).filter((record) => status === "all" || record.status === status);
}

export async function approveVerification(sitterId) { const sitter = await prisma.pet_sitter.findUnique({ where: { sitter_id: sitterId }, select: { sitter_id: true, is_verified: true } }); if (!sitter || sitter.is_verified) return false; await prisma.pet_sitter.update({ where: { sitter_id: sitterId }, data: { is_verified: true } }); return true; }
