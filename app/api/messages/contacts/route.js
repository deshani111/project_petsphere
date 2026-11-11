import { actor, contacts } from "../../../../modules/messaging/messaging.service";
import { endpoint, json } from "../../../../modules/messaging/messaging-http";

export const GET = endpoint(async () => json({ contacts: await contacts(await actor()) }));

