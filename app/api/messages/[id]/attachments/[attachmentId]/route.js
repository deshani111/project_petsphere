import { get } from "@vercel/blob";
import { prisma } from "../../../../../../lib/prisma";
import { actor, authorizedConversation, idOf, MessagingError } from "../../../../../../modules/messaging/messaging.service";
import { endpoint } from "../../../../../../modules/messaging/messaging-http";

export const GET = endpoint(async (request, { params }) => {
  const user = await actor();
  const { id, attachmentId } = await params;
  const thread = await authorizedConversation(user, id);
  const file = await prisma.message_attachment.findFirst({
    where: { attachment_id: idOf(attachmentId), message: { conversation_id: thread.conversation_id } },
  });
  if (!file) throw new MessagingError(404, "Attachment not found.");
  const token = process.env.MESSAGING_BLOB_READ_WRITE_TOKEN;
  if (!token) throw new MessagingError(503, "Attachment storage is unavailable.");
  const result = await get(file.storage_key, { token, access: "private" });
  if (!result?.stream) throw new MessagingError(404, "Attachment not found.");
  const inline = file.mime_type.startsWith("image/") && !new URL(request.url).searchParams.has("download");
  const name = encodeURIComponent(file.original_name).replace(/['()*]/g, (char) => "%" + char.charCodeAt(0).toString(16));
  return new Response(result.stream, { headers: {
    "Content-Type": file.mime_type, "Content-Length": String(file.file_size),
    "Content-Disposition": (inline ? "inline" : "attachment") + "; filename*=UTF-8''" + name,
    "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
});

