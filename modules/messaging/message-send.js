import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { identifyAttachment, MAX_BYTES, MAX_FILES } from "./attachment-validation.mjs";
import { authorizedConversation, existingMessage, MessagingError, saveMessage } from "./messaging.service";
import { boundedBody, jsonInput } from "./messaging-http";

export async function send(user, id, request) {
  const row = await authorizedConversation(user, id);
  const type = request.headers.get("content-type") ?? "";
  let payload, files = [];
  if (type.startsWith("multipart/form-data")) {
    const bytes = await boundedBody(request, MAX_BYTES + 65536);
    let form;
    try { form = await new Response(bytes, { headers: { "Content-Type": type } }).formData(); }
    catch { throw new MessagingError(400, "Invalid attachment upload."); }
    payload = { text: form.get("text"), clientId: form.get("clientId") };
    files = form.getAll("files");
  } else {
    payload = await jsonInput(request);
  }
  const { clientId } = payload;
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (typeof clientId !== "string" || !/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(clientId)) throw new MessagingError(400, "Invalid message key.");
  const previous = await existingMessage(user, row, clientId);
  if (previous) return previous;
  if ((!text && !files.length) || text.length > 2000) throw new MessagingError(400, "Add an attachment or enter a message up to 2,000 characters.");
  if (files.length > MAX_FILES || files.some((file) => !(file instanceof File) || !file.size) ||
      files.reduce((total, file) => total + file.size, 0) > MAX_BYTES) throw new MessagingError(413, "Attach up to five files, 3 MB combined.");
  const attachments = await Promise.all(files.map(async (file) => {
    const name = Array.from(file.name.normalize("NFC").replace(/[\u0000-\u001f\u007f/\\]/g, "_")).slice(0, 180).join("");
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = identifyAttachment(name, bytes, file.type);
    if (!mime) throw new MessagingError(400, "Unsupported or invalid attachment: " + name);
    return { original_name: name, mime_type: mime, file_size: bytes.length, bytes };
  }));
  const token = process.env.MESSAGING_BLOB_READ_WRITE_TOKEN;
  if (attachments.length && !token) throw new MessagingError(503, "Attachments are not configured. You can still send text messages.");
  const attempted = [];
  try {
    const metadata = [];
    for (const { bytes, ...file } of attachments) {
      const key = "messages/" + row.conversation_id + "/" + randomUUID();
      attempted.push(key);
      await put(key, bytes, { token, access: "private", contentType: file.mime_type, addRandomSuffix: false });
      metadata.push({ ...file, storage_key: key });
    }
    return await saveMessage(user, row, clientId, text, metadata);
  } catch (error) {
    let persisted;
    try { persisted = await existingMessage(user, row, clientId); }
    catch (lookupError) {
      if (!(lookupError instanceof MessagingError)) {
        console.error("Message commit could not be checked; attachment keys retained for reconciliation", attempted);
        throw error;
      }
    }
    if (attempted.length) {
      // A retry may have committed on another request. Delete only this attempt's unreferenced keys.
      const { prisma } = await import("../../lib/prisma");
      const referenced = await prisma.message_attachment.findMany({ where: { storage_key: { in: attempted } }, select: { storage_key: true } });
      const unused = attempted.filter((key) => !referenced.some((file) => file.storage_key === key));
      if (unused.length) await del(unused, { token }).catch(() => console.error("Private attachment cleanup needs retry", unused));
    }
    if (persisted) return persisted;
    throw error;
  }
}

