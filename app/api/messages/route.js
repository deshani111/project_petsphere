import { actor, listConversations, openConversation } from "../../../modules/messaging/messaging.service";
import { endpoint, json, jsonInput } from "../../../modules/messaging/messaging-http";

export const GET = endpoint(async (request) => json(await listConversations(await actor(), new URL(request.url).searchParams.get("before"))));
export const POST = endpoint(async (request) => {
  const user = await actor();
  return json(await openConversation(user, await jsonInput(request)));
});

