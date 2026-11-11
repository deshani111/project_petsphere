import { randomUUID } from "node:crypto";
import { actor, authorizedConversation, findDirectSitterConversation, history, MessagingError, openConversation, saveMessage } from "../../../../../modules/messaging/messaging.service";
import { endpoint, json, jsonInput } from "../../../../../modules/messaging/messaging-http";

async function sitter() {
  const user = await actor();
  if (user.role !== "pet_sitter") throw new MessagingError(403, "Sitter access is required.");
  return user;
}

export const GET = endpoint(async (_, { params }) => {
  const user = await sitter();
  const ownerId = (await params).userId;
  const id = await findDirectSitterConversation(user, ownerId);
  const result = await history(user, id);
  return json({ ...result, messages: result.messages.map((message) => legacy(message, user, ownerId)) });
});
export const POST = endpoint(async (request, { params }) => {
  const user = await sitter();
  const input = await jsonInput(request);
  const text = typeof input.text === "string" ? input.text.trim() : "";
  if (!text || text.length > 2000) throw new MessagingError(400, "Enter a message up to 2,000 characters.");
  const { id } = await openConversation(user, { ownerUserId: (await params).userId });
  const row = await authorizedConversation(user, id);
  return json({ message: legacy(await saveMessage(user, row, randomUUID(), text, []), user, (await params).userId) }, 201);
});


function legacy(message, user, ownerId) {
  return { ...message, message_id: message.id, sender_id: message.mine ? String(user.id) : ownerId, message_text: message.text, sent_date: message.sentAt, is_read: message.seen };
}
