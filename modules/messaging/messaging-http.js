import { MessagingError } from "./messaging.service";

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function endpoint(handler) {
  return async (request, context) => {
    try {
      if (request.method !== "GET") {
        const origin = request.headers.get("origin");
        if (origin && new URL(origin).host !== (request.headers.get("host") ?? new URL(request.url).host)) {
          throw new MessagingError(403, "Invalid request origin.");
        }
      }
      return await handler(request, context);
    } catch (error) {
      if (error instanceof MessagingError) return json({ message: error.message }, error.status);
      console.error("Messaging request failed", { code: error?.code, name: error?.name });
      return json({ message: "Messaging is temporarily unavailable. Please try again." }, 503);
    }
  };
}
export async function boundedBody(request, limit) {
  if (Number(request.headers.get("content-length")) > limit) throw new MessagingError(413, "This upload is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new MessagingError(400, "Request body required.");
  const parts = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel().catch(() => {});
        throw new MessagingError(413, "This upload is too large.");
      }
      parts.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(parts, length);
}
export async function jsonInput(request) {
  const bytes = await boundedBody(request, 8192);
  try {
    const value = JSON.parse(bytes.toString());
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new MessagingError(400, "Invalid request body."); }
}

