import { actor, history, markRead } from "../../../../modules/messaging/messaging.service";
import { send } from "../../../../modules/messaging/message-send";
import { endpoint, json, jsonInput } from "../../../../modules/messaging/messaging-http";

export const GET = endpoint(async (request, { params }) => {
  const user = await actor();
  const query = new URL(request.url).searchParams;
  return json(await history(user, (await params).id, query.get("before"), query.get("after")));
});
export const POST = endpoint(async (request, { params }) => json({ message: await send(await actor(), (await params).id, request) }, 201));
export const PATCH = endpoint(async (request, { params }) => {
  const user = await actor();
  await markRead(user, (await params).id, (await jsonInput(request)).through);
  return json({ ok: true });
});

