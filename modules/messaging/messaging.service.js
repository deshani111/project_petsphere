import { prisma } from "../../lib/prisma";
import { getCurrentSession } from "../../lib/session";

export class MessagingError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function idOf(value) {
  if (typeof value !== "string" || !/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > BigInt("9223372036854775807")) throw new MessagingError(400, "Invalid identifier.");
  return BigInt(value);
}
export async function actor() {
  const session = await getCurrentSession();
  if (!session) throw new MessagingError(401, "Sign in to use messages.");
  if (!["pet_owner", "pet_sitter"].includes(session.role)) throw new MessagingError(403, "Messaging is for owners and sitters.");
  return { id: idOf(session.sub), role: session.role };
}

const person = { role: true, user_id: true, first_name: true, last_name: true, pet_sitter: { select: { profile_image: true } } };
const bookingSelect = {
  booking_id: true, start_date: true, end_date: true,
  pet_owner: { select: { user_id: true, users: { select: { role: true } } } },
  pet_sitter: { select: { user_id: true, users: { select: { role: true } } } },
  pet: { select: { pet_name: true } }, service_type: { select: { name: true } },
};
const context = { owner: { select: person }, sitter: { select: person }, booking: { select: bookingSelect } };
const attachmentFields = { attachment_id: true, original_name: true, mime_type: true, file_size: true };
const messageFields = { message_id: true, sender_id: true, message_text: true, is_read: true, sent_date: true, attachments: { select: attachmentFields, orderBy: { attachment_id: "asc" } } };
const membership = (user) => user.role === "pet_owner" ? { owner_user_id: user.id } : { sitter_user_id: user.id };
const validBooking = (row) => row.owner.role === "pet_owner" && row.sitter.role === "pet_sitter" && (!row.booking_id || (row.booking?.pet_owner.user_id === row.owner_user_id && row.booking?.pet_sitter?.user_id === row.sitter_user_id));

function summary(row, user) {
  const other = user.role === "pet_owner" ? row.sitter : row.owner;
  return {
    id: String(row.conversation_id), userId: String(other.user_id), name: [other.first_name, other.last_name].filter(Boolean).join(" "),
    avatar: other.pet_sitter?.profile_image ?? null, updatedAt: row.updated_at,
    booking: row.booking ? {
      id: String(row.booking.booking_id), pet: row.booking.pet.pet_name,
      service: row.booking.service_type?.name ?? null,
      start: row.booking.start_date?.toISOString().slice(0, 10) ?? null,
      end: row.booking.end_date?.toISOString().slice(0, 10) ?? null,
    } : null,
  };
}
function serializeMessage(row, user) {
  return {
    id: String(row.message_id), mine: row.sender_id === user.id, text: row.message_text,
    seen: row.is_read, sentAt: row.sent_date,
    attachments: row.attachments.map((file) => ({
      id: String(file.attachment_id), name: file.original_name, type: file.mime_type, size: file.file_size,
    })),
  };
}

export async function authorizedConversation(user, value) {
  const row = await prisma.conversation.findFirst({ where: { conversation_id: idOf(value), ...membership(user) }, include: context });
  if (!row || !validBooking(row)) throw new MessagingError(404, "Conversation not found.");
  return row;
}

export async function openConversation(user, input) {
  const ownerRole = user.role === "pet_owner";
  let bookingId = null;
  let ownerId;
  let sitterId;
  if (input.bookingId) {
    bookingId = idOf(input.bookingId);
    const booking = await prisma.booking.findUnique({ where: { booking_id: bookingId }, select: bookingSelect });
    if (!booking || (ownerRole ? booking.pet_owner.user_id : booking.pet_sitter?.user_id) !== user.id) throw new MessagingError(404, "Booking not found.");
    ownerId = booking.pet_owner.user_id;
    sitterId = booking.pet_sitter?.user_id;
    if (!sitterId) throw new MessagingError(409, "A sitter has not been assigned to this booking.");
    if (booking.pet_owner.users.role !== "pet_owner" || booking.pet_sitter.users.role !== "pet_sitter") throw new MessagingError(404, "Booking participants are unavailable.");
  } else if (ownerRole) {
    const sitter = await prisma.pet_sitter.findUnique({
      where: { sitter_id: idOf(input.sitterId) }, select: { user_id: true, users: { select: { role: true } } },
    });
    if (sitter?.users.role !== "pet_sitter") throw new MessagingError(404, "Sitter not found.");
    ownerId = user.id;
    sitterId = sitter.user_id;
  } else {
    ownerId = idOf(input.ownerUserId);
    sitterId = user.id;
    const related = await prisma.booking.findFirst({
      where: { pet_owner: { user_id: ownerId, users: { role: "pet_owner" } }, pet_sitter: { user_id: sitterId } },
      select: { booking_id: true },
    });
    if (!related) {
      const existing = await prisma.conversation.findUnique({ where: { scope_key: "direct:" + ownerId + ":" + sitterId } });
      if (!existing) throw new MessagingError(404, "Owner not found in your bookings.");
      await authorizedConversation(user, String(existing.conversation_id));
    }
  }
  if (ownerId === sitterId) throw new MessagingError(400, "You cannot message yourself.");
  const scope = (bookingId ? "booking:" + bookingId + ":" : "direct:") + ownerId + ":" + sitterId;
  const [saved] = await prisma.$queryRaw`
    INSERT INTO conversation (scope_key, owner_user_id, sitter_user_id, booking_id)
    VALUES (${scope}, ${ownerId}, ${sitterId}, ${bookingId})
    ON CONFLICT (scope_key) DO UPDATE SET scope_key = EXCLUDED.scope_key
    RETURNING conversation_id
  `;
  return { id: String(saved.conversation_id) };
}

export async function listConversations(user, before) {
  // A stale booking conversation can remain a valid pagination cursor without revealing its content.
  const cursor = before ? await prisma.conversation.findFirst({ where: { conversation_id: idOf(before), ...membership(user) } }) : null;
  const rows = await prisma.conversation.findMany({
    where: {
      ...membership(user),
      ...(cursor ? { OR: [{ updated_at: { lt: cursor.updated_at } }, { updated_at: cursor.updated_at, conversation_id: { lt: cursor.conversation_id } }] } : {}),
    },
    orderBy: [{ updated_at: "desc" }, { conversation_id: "desc" }], take: 41,
    include: {
      ...context,
      messages: { orderBy: { message_id: "desc" }, take: 1, select: { message_text: true, attachments: { take: 1, select: { mime_type: true } } } },
      _count: { select: { messages: { where: { receiver_id: user.id, is_read: false } } } },
    },
  });
  return {
    conversations: rows.slice(0, 40).filter(validBooking).map((row) => {
      const latest = row.messages[0];
      const file = latest?.attachments[0];
      return { ...summary(row, user), unread: row._count.messages,
        preview: latest?.message_text || (file ? (file.mime_type.startsWith("image/") ? "Sent an image" : "Sent a file") : "No messages yet") };
    }),
    next: rows.length > 40 ? String(rows[39].conversation_id) : null,
  };
}

export async function contacts(user) {
  if (user.role === "pet_owner") {
    const sitters = await prisma.pet_sitter.findMany({
      where: { users: { role: "pet_sitter" } }, orderBy: { sitter_id: "asc" }, take: 100,
      select: { sitter_id: true, profile_image: true, users: { select: person } },
    });
    return sitters.map(({ sitter_id, users, profile_image }) => ({ id: String(sitter_id), name: users.first_name + " " + users.last_name, avatar: profile_image }));
  }
  const owners = await prisma.pet_owner.findMany({
    where: { users: { role: "pet_owner" }, booking: { some: { pet_sitter: { user_id: user.id } } } },
    orderBy: { owner_id: "asc" }, take: 100, select: { users: { select: person } },
  });
  return owners.map(({ users }) => ({ id: String(users.user_id), name: users.first_name + " " + users.last_name, avatar: null }));
}

export async function history(user, value, before, after) {
  const row = await authorizedConversation(user, value);
  if (before && after) throw new MessagingError(400, "Use one history cursor.");
  const result = await prisma.message.findMany({
    where: { conversation_id: row.conversation_id, ...(before || after ? { message_id: before ? { lt: idOf(before) } : { gt: idOf(after) } } : {}) },
    orderBy: { message_id: after ? "asc" : "desc" }, take: 41, select: messageFields,
  });
  const page = result.slice(0, 40);
  if (!after) page.reverse();
  const latestSeen = await prisma.message.findFirst({
    where: { conversation_id: row.conversation_id, sender_id: user.id, is_read: true },
    orderBy: { message_id: "desc" }, select: { message_id: true },
  });
  return {
    conversation: summary(row, user), messages: page.map((item) => serializeMessage(item, user)),
    next: result.length > 40 ? String((after ? page.at(-1) : page[0]).message_id) : null,
    seenThrough: latestSeen ? String(latestSeen.message_id) : null,
  };
}

export async function markRead(user, value, through) {
  const row = await authorizedConversation(user, value);
  const marker = idOf(through);
  const seen = await prisma.message.findFirst({ where: { conversation_id: row.conversation_id, message_id: marker }, select: { message_id: true } });
  if (!seen) throw new MessagingError(400, "Invalid read marker.");
  await prisma.message.updateMany({
    where: { conversation_id: row.conversation_id, receiver_id: user.id, message_id: { lte: marker }, is_read: false },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function saveMessage(user, row, clientId, text, attachments) {
  const result = await prisma.$transaction(async (tx) => {
    // Serialize sends per thread so readers never skip an earlier ID committed late.
    await tx.$queryRaw`SELECT conversation_id FROM conversation WHERE conversation_id = ${row.conversation_id} FOR UPDATE`;
    if (row.booking_id) await tx.$queryRaw`SELECT booking_id FROM booking WHERE booking_id = ${row.booking_id} FOR SHARE`;
    const current = await tx.conversation.findFirst({ where: { conversation_id: row.conversation_id, ...membership(user) }, include: context });
    if (!current || !validBooking(current)) throw new MessagingError(404, "Conversation not found.");
    const saved = await tx.message.create({
      data: { client_id: clientId, conversation_id: row.conversation_id, sender_id: user.id,
        receiver_id: user.role === "pet_owner" ? row.sitter_user_id : row.owner_user_id,
        message_text: text || null, attachments: { create: attachments } }, select: messageFields,
    });
    await tx.conversation.updateMany({ where: { conversation_id: row.conversation_id, updated_at: { lt: saved.sent_date } }, data: { updated_at: saved.sent_date } });
    return saved;
  });
  return serializeMessage(result, user);
}

export async function existingMessage(user, row, clientId) {
  const found = await prisma.message.findUnique({
    where: { sender_id_client_id: { sender_id: user.id, client_id: clientId } },
    select: { ...messageFields, conversation_id: true },
  });
  if (!found) return null;
  if (found.conversation_id !== row.conversation_id) throw new MessagingError(409, "Message key already used.");
  return serializeMessage(found, user);
}

export async function signal(user) {
  const [row] = await prisma.$queryRaw`
    WITH eligible AS (
      SELECT c.conversation_id FROM conversation c
      JOIN users owner_user ON owner_user.user_id = c.owner_user_id AND owner_user.role = 'pet_owner'
      JOIN users sitter_user ON sitter_user.user_id = c.sitter_user_id AND sitter_user.role = 'pet_sitter'
      LEFT JOIN booking b ON b.booking_id = c.booking_id
      LEFT JOIN pet_owner o ON o.owner_id = b.owner_id
      LEFT JOIN pet_sitter s ON s.sitter_id = b.sitter_id
      WHERE (${user.role} = 'pet_owner' AND c.owner_user_id = ${user.id}
        OR ${user.role} = 'pet_sitter' AND c.sitter_user_id = ${user.id})
        AND (c.booking_id IS NULL OR (o.user_id = c.owner_user_id AND s.user_id = c.sitter_user_id))
    )
    SELECT (SELECT COUNT(*)::int FROM message m JOIN eligible e USING (conversation_id)
      WHERE m.receiver_id = ${user.id} AND NOT m.is_read) AS unread,
      MD5(COALESCE(STRING_AGG(c.conversation_id || ':' || COALESCE(latest.message_id::text, '') || ':' ||
        COALESCE(seen.read_at::text, ''), ',' ORDER BY c.conversation_id), '')) AS revision
    FROM eligible c
    LEFT JOIN LATERAL (SELECT m.message_id FROM message m WHERE m.conversation_id = c.conversation_id
      ORDER BY m.message_id DESC LIMIT 1) latest ON true
    LEFT JOIN LATERAL (SELECT m.read_at FROM message m WHERE m.conversation_id = c.conversation_id
      AND m.read_at IS NOT NULL ORDER BY m.read_at DESC LIMIT 1) seen ON true
  `;
  return row;
}


export async function findDirectSitterConversation(user, ownerValue) {
  const ownerId = idOf(ownerValue);
  const row = await prisma.conversation.findUnique({ where: { scope_key: "direct:" + ownerId + ":" + user.id } });
  if (!row) throw new MessagingError(404, "Conversation not found.");
  return String(row.conversation_id);
}
