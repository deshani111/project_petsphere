import { actor, contacts, listConversations, MessagingError } from "../../../../modules/messaging/messaging.service";
import { endpoint, json } from "../../../../modules/messaging/messaging-http";

export const GET = endpoint(async () => {
  const user = await actor();
  if (user.role !== "pet_sitter") throw new MessagingError(403, "Sitter access is required.");
  const { conversations } = await listConversations(user);
  return json({ conversations: conversations.filter((row) => !row.booking).map((row) => ({ ...row, sentAt: row.updatedAt })), contacts: (await contacts(user)).map((row) => ({ ...row, userId: row.id })) });
});
