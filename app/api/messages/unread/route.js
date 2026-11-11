import { actor, signal } from "../../../../modules/messaging/messaging.service";
import { endpoint, json } from "../../../../modules/messaging/messaging-http";

export const GET = endpoint(async () => json({ unread: (await signal(await actor())).unread }));

