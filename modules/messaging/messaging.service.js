import { prisma } from "../../lib/prisma";

function serialize(value) {
  return JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item
  ));
}

function validMessage(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 2000;
}

async function parseUserId(value) {
  return typeof value === "string" && /^\d+$/.test(value) ? BigInt(value) : null;
}

async function canSitterContact(sitter, userId) {
  const [existingMessage, booking] = await Promise.all([
    prisma.message.findFirst({
      where: {
        OR: [
          { sender_id: sitter.user_id, receiver_id: userId },
          { sender_id: userId, receiver_id: sitter.user_id },
        ],
      },
      select: { message_id: true },
    }),
    prisma.booking.findFirst({
      where: { sitter_id: sitter.sitter_id, pet_owner: { user_id: userId } },
      select: { booking_id: true },
    }),
  ]);
  return Boolean(existingMessage || booking);
}

export async function getSitterConversations(sitter) {
  const [messages, bookings] = await Promise.all([
    prisma.message.findMany({
      where: { OR: [{ sender_id: sitter.user_id }, { receiver_id: sitter.user_id }] },
      include: {
        users_message_sender_idTousers: { select: { user_id: true, first_name: true, last_name: true } },
        users_message_receiver_idTousers: { select: { user_id: true, first_name: true, last_name: true } },
      },
      orderBy: { sent_date: "desc" },
    }),
    prisma.booking.findMany({
      where: { sitter_id: sitter.sitter_id },
      select: { pet_owner: { select: { users: { select: { user_id: true, first_name: true, last_name: true } } } } },
    }),
  ]);

  const seen = new Set();
  const conversations = [];
  for (const message of messages) {
    const other = message.sender_id === sitter.user_id
      ? message.users_message_receiver_idTousers
      : message.users_message_sender_idTousers;
    const otherId = other.user_id.toString();
    if (seen.has(otherId)) continue;
    seen.add(otherId);
    conversations.push({
      userId: otherId,
      name: `${other.first_name} ${other.last_name}`.trim(),
      preview: message.message_text,
      sentAt: message.sent_date,
      unread: messages.filter((item) => item.sender_id === other.user_id && item.receiver_id === sitter.user_id && !item.is_read).length,
    });
  }

  const contacts = [];
  for (const booking of bookings) {
    const user = booking.pet_owner.users;
    if (!seen.has(user.user_id.toString())) {
      contacts.push({ userId: user.user_id.toString(), name: `${user.first_name} ${user.last_name}`.trim() });
    }
  }

  return serialize({ conversations, contacts });
}

export async function getSitterConversation(sitter, recipientValue) {
  const userId = await parseUserId(recipientValue);
  if (!userId) return { error: "Invalid conversation recipient.", status: 400 };
  if (!(await canSitterContact(sitter, userId))) return { error: "This conversation is unavailable.", status: 403 };

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { sender_id: sitter.user_id, receiver_id: userId },
        { sender_id: userId, receiver_id: sitter.user_id },
      ],
    },
    orderBy: { sent_date: "asc" },
  });
  await prisma.message.updateMany({
    where: { sender_id: userId, receiver_id: sitter.user_id, is_read: false },
    data: { is_read: true },
  });
  return { messages: serialize(messages) };
}

export async function sendSitterMessage(sitter, recipientValue, text) {
  const userId = await parseUserId(recipientValue);
  if (!userId) return { error: "Invalid conversation recipient.", status: 400 };
  if (!validMessage(text)) return { error: "Message must be between 1 and 2,000 characters.", status: 400 };
  if (!(await canSitterContact(sitter, userId))) return { error: "You can only message pet owners connected to your bookings.", status: 403 };

  const message = await prisma.message.create({
    data: { sender_id: sitter.user_id, receiver_id: userId, message_text: text.trim() },
  });
  return { message: serialize(message) };
}
