import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { identifyAttachment, MAX_BYTES } from "../modules/messaging/attachment-validation.mjs";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==", "base64");
const webp = Buffer.from("524946460e000000574542505650384c020000002f00", "hex");
const jpeg = Buffer.from("ffd8ffe00000ffd9", "hex");
const pdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n");

function docx(names) {
  const locals = [], central = [];
  let offset = 0;
  for (const entry of names) {
    const name = Buffer.from(entry);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);
    const record = Buffer.alloc(46 + name.length);
    record.writeUInt32LE(0x02014b50);
    record.writeUInt16LE(name.length, 28);
    record.writeUInt32LE(offset, 42);
    name.copy(record, 46);
    locals.push(local); central.push(record); offset += local.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(names.length, 8); end.writeUInt16LE(names.length, 10);
  end.writeUInt32LE(central.reduce((total, bytes) => total + bytes.length, 0), 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...central, end]);
}

test("attachment allowlist rejects spoofed signatures, macros and oversized payloads", () => {
  assert.equal(identifyAttachment("photo.PNG", png), "image/png");
  assert.equal(identifyAttachment("photo.jpg", jpeg), "image/jpeg");
  assert.equal(identifyAttachment("photo.webp", webp), "image/webp");
  assert.equal(identifyAttachment("document.pdf", pdf), "application/pdf");
  assert.match(identifyAttachment("document.docx", docx(["[Content_Types].xml", "word/document.xml"])), /wordprocessingml/);
  assert.equal(identifyAttachment("notes.txt", Buffer.from("Care instructions\n")), "text/plain");
  assert.equal(identifyAttachment("bad.docx", docx(["[Content_Types].xml", "word/document.xml", "word/vbaProject.bin"])), null);
  assert.equal(identifyAttachment("bad.docx", docx(["[Content_Types].xml", "../word/document.xml"])), null);
  assert.equal(identifyAttachment("bad.docx", Buffer.from("PK\x03\x04random")), null);
  assert.equal(identifyAttachment("bad.png", pdf), null);
  assert.equal(identifyAttachment("bad.svg", Buffer.from("<svg>")), null);
  assert.equal(identifyAttachment("bad.txt", Buffer.from([0, 255])), null);
  assert.equal(identifyAttachment("bad.png", png, "text/html"), null);
  assert.equal(identifyAttachment("huge.txt", Buffer.alloc(MAX_BYTES + 1, "a")), null);
});

test("shared messaging handlers persist, scope, paginate and authorize conversations and attachments", async (t) => {
  const db = await PGlite.create();
  const socket = new PGLiteSocketServer({ db, port: 0, host: "127.0.0.1", maxConnections: 1 });
  const previousToken = process.env.MESSAGING_BLOB_READ_WRITE_TOKEN;
  const fixture = { session: new AsyncLocalStorage(), blobs: new Map(), putLimit: Infinity };
  let prisma, hooks;
  t.after(async () => {
    hooks?.deregister();
    await prisma?.$disconnect();
    if (prisma) await socket.stop();
    await db.close();
    delete globalThis.messagingFixture;
    if (previousToken === undefined) delete process.env.MESSAGING_BLOB_READ_WRITE_TOKEN;
    else process.env.MESSAGING_BLOB_READ_WRITE_TOKEN = previousToken;
  });

  // The base schema is created in an empty in-memory test database. Never use DATABASE_URL here.
  await db.exec(readFileSync(new URL("../petsphere_schema.sql", import.meta.url), "utf8").replace(/^DROP TABLE.*;\r?$/gm, ""));
  await db.exec(`
    ALTER TABLE pet_sitter ADD COLUMN profile_image VARCHAR(500);
    INSERT INTO users (first_name,last_name,email,password_hash,role) VALUES
      ('Owner','One','one@example.test','unused','pet_owner'),
      ('Sitter','Two','two@example.test','unused','pet_sitter'),
      ('Owner','Three','three@example.test','unused','pet_owner'),
      ('Sitter','Four','four@example.test','unused','pet_sitter');
    INSERT INTO pet_owner (user_id) VALUES (1),(3);
    INSERT INTO pet_sitter (user_id) VALUES (2),(4);
    INSERT INTO pet (owner_id,pet_name) VALUES (1,'Cooper');
    INSERT INTO service_type (name) VALUES ('Boarding');
    INSERT INTO booking (owner_id,sitter_id,pet_id,service_type_id,start_date,end_date) VALUES (1,1,1,1,'2027-01-01','2027-01-03'),(1,NULL,1,1,'2027-02-01','2027-02-02');
    INSERT INTO message(sender_id,receiver_id,message_text,is_read) VALUES (2,1,'Legacy message',true);
  `);
  await db.exec(readFileSync(new URL("../prisma/migrations/20261110090000_add_shared_messaging/migration.sql", import.meta.url), "utf8"));
  await socket.start();
  prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: "postgres://postgres:postgres@" + socket.getServerConn() + "/postgres?sslmode=disable", max: 1 }) });
  fixture.prisma = prisma;
  globalThis.messagingFixture = fixture;
  process.env.MESSAGING_BLOB_READ_WRITE_TOKEN = "fixture-only";
  const moduleSource = (value) => "data:text/javascript," + encodeURIComponent(value);
  hooks = registerHooks({
    resolve(specifier, context, next) {
      if (specifier.endsWith("/lib/prisma")) return { url: moduleSource("export const prisma = globalThis.messagingFixture.prisma;"), shortCircuit: true };
      if (specifier.endsWith("/lib/session")) return { url: moduleSource("export const getCurrentSession = () => globalThis.messagingFixture.session.getStore();"), shortCircuit: true };
      if (specifier === "@vercel/blob") return { url: moduleSource(`
        const fixture = globalThis.messagingFixture;
        export async function put(key, bytes, options) {
          if (options.access !== "private" || options.token !== "fixture-only") throw new Error("Expected private storage");
          if (fixture.putLimit-- <= 0) throw new Error("Injected upload failure");
          fixture.blobs.set(key, new Uint8Array(bytes));
        }
        export async function get(key, options) {
          if (options.access !== "private" || options.token !== "fixture-only") throw new Error("Expected private storage");
          const bytes = fixture.blobs.get(key);
          return bytes ? { stream: new Blob([bytes]).stream() } : null;
        }
        export async function del(keys) { for (const key of keys) fixture.blobs.delete(key); }
      `), shortCircuit: true };
      if (specifier.startsWith(".") && !/\.[cm]?js$/.test(specifier) && context.parentURL?.startsWith("file:")) {
        const file = new URL(specifier + ".js", context.parentURL);
        if (existsSync(fileURLToPath(file))) return next(file.href, context);
      }
      return next(specifier, context);
    },
  });
  const inbox = await import("../app/api/messages/route.js");
  const thread = await import("../app/api/messages/[id]/route.js");
  const download = await import("../app/api/messages/[id]/attachments/[attachmentId]/route.js");
  const unread = await import("../app/api/messages/unread/route.js");
  const events = await import("../app/api/messages/events/route.js");
  const owner = { sub: "1", role: "pet_owner" };
  const sitter = { sub: "2", role: "pet_sitter" };
  const stranger = { sub: "3", role: "pet_owner" };
  const invoke = async (user, handler, method = "GET", body, params, query = "", headers = {}) =>
    fixture.session.run(user, () => handler(new Request("http://localhost/api/messages" + query, {
      method, headers: { ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }), { params: Promise.resolve(params) }));
  const data = async (...args) => {
    const res = await invoke(...args);
    const json = await res.json();
    assert.ok(res.ok, JSON.stringify(json));
    return json;
  };
  assert.equal((await invoke(null, inbox.GET)).status, 401);
  assert.equal((await invoke(owner, inbox.POST, "POST", { sitterId: "1" }, undefined, "", { Origin: "https://unrelated.example" })).status, 403);
  const direct = (await data(owner, inbox.POST, "POST", { sitterId: "1" })).id;
  assert.equal((await data(owner, thread.GET, "GET", undefined, { id: direct })).messages[0].text, "Legacy message");
  const opened = await Promise.all([
    data(owner, inbox.POST, "POST", { bookingId: "1" }),
    data(sitter, inbox.POST, "POST", { bookingId: "1" }),
  ]);
  const id = opened[0].id;
  assert.equal(opened[1].id, id);
  assert.notEqual(id, direct);
  assert.equal((await invoke(stranger, inbox.POST, "POST", { bookingId: "1" })).status, 404);
  assert.equal((await invoke(owner, inbox.POST, "POST", { bookingId: "2" })).status, 409);
  assert.equal((await invoke(stranger, thread.GET, "GET", undefined, { id })).status, 404);
  assert.equal((await invoke(stranger, thread.POST, "POST", { text: "not allowed", clientId: randomUUID() }, { id })).status, 404);
  assert.equal((await invoke(stranger, thread.PATCH, "PATCH", { through: "1" }, { id })).status, 404);

  const key = randomUUID();
  const sends = await Promise.all([
    data(owner, thread.POST, "POST", { text: "Hi sitter", clientId: key, senderId: stranger.sub }, { id }),
    data(owner, thread.POST, "POST", { text: "Hi sitter", clientId: key }, { id }),
  ]);
  assert.equal(sends[0].message.id, sends[1].message.id);
  assert.equal(sends[0].message.seen, false);
  assert.equal((await data(owner, unread.GET)).unread, 0);
  assert.equal((await data(sitter, unread.GET)).unread, 1);
  assert.equal((await data(sitter, inbox.GET)).conversations[0].id, id);
  const openedThread = await data(sitter, thread.GET, "GET", undefined, { id });
  assert.equal(openedThread.conversation.booking.pet, "Cooper");
  assert.equal(openedThread.conversation.booking.service, "Boarding");
  assert.equal(openedThread.messages[0].mine, false);
  assert.equal((await data(sitter, unread.GET)).unread, 1, "fetching does not mark read");
  const eventResponse = await invoke(sitter, events.GET);
  assert.equal(eventResponse.headers.get("content-type"), "text/event-stream");
  const reader = eventResponse.body.getReader();
  const decoder = new TextDecoder();
  assert.match(decoder.decode((await reader.read()).value), /retry:/);
  assert.match(decoder.decode((await reader.read()).value), /"unread":1/);
  await data(sitter, thread.PATCH, "PATCH", { through: sends[0].message.id }, { id });
  assert.match(decoder.decode((await reader.read()).value), /"unread":0/);
  await reader.cancel();
  assert.equal((await data(sitter, unread.GET)).unread, 0);
  assert.equal((await data(owner, thread.GET, "GET", undefined, { id })).messages[0].seen, true);
  await data(sitter, thread.POST, "POST", { text: "Hi owner", clientId: randomUUID() }, { id });
  assert.equal((await data(owner, unread.GET)).unread, 1);
  assert.equal((await invoke(owner, thread.POST, "POST", { text: " ", clientId: randomUUID() }, { id })).status, 400);

  function formFor(files) {
    const form = new FormData();
    form.set("clientId", randomUUID());
    files.forEach(([name, bytes, mime]) => form.append("files", new File([bytes], name, { type: mime })));
    return form;
  }
  const uploads = formFor([["photo.png", png, "image/png"], ["care.txt", Buffer.from("Care notes"), "text/plain"]]);
  const uploaded = (await data(owner, thread.POST, "POST", uploads, { id })).message;
  assert.equal(uploaded.text, null);
  assert.equal(uploaded.attachments.length, 2);
  assert.equal((await data(owner, thread.POST, "POST", uploads, { id })).message.id, uploaded.id);
  assert.equal(fixture.blobs.size, 2);
  assert.equal((await data(sitter, inbox.GET)).conversations[0].preview, "Sent an image");

  const fileId = uploaded.attachments[1].id;
  const res = await invoke(sitter, download.GET, "GET", undefined, { id, attachmentId: fileId });
  assert.equal(await res.text(), "Care notes");
  assert.match(res.headers.get("content-disposition"), /^attachment;/);
  const image = await invoke(sitter, download.GET, "GET", undefined, { id, attachmentId: uploaded.attachments[0].id });
  assert.match(image.headers.get("content-disposition"), /^inline;/);
  assert.equal((await invoke(stranger, download.GET, "GET", undefined, { id, attachmentId: fileId })).status, 404);
  assert.equal((await invoke(sitter, download.GET, "GET", undefined, { id: direct, attachmentId: fileId })).status, 404);
  assert.equal((await invoke(owner, thread.POST, "POST", formFor([["fake.png", pdf, "image/png"]]), { id })).status, 400);
  assert.equal((await invoke(owner, thread.POST, "POST", formFor([["large.txt", Buffer.alloc(MAX_BYTES + 1, "a"), "text/plain"]]), { id })).status, 413);
  fixture.putLimit = 1;
  assert.equal((await invoke(owner, thread.POST, "POST", formFor([["a.png", png, "image/png"], ["b.png", png, "image/png"]]), { id })).status, 503);
  assert.equal(fixture.blobs.size, 2, "failed upload rolls back its stored objects");
  assert.equal((await data(owner, thread.GET, "GET", undefined, { id })).messages.length, 3, "failed upload creates no message");

  for (let i = 0; i < 41; i++) await data(sitter, thread.POST, "POST", { text: "Message " + i, clientId: randomUUID() }, { id });
  const recent = await data(owner, thread.GET, "GET", undefined, { id });
  assert.equal(recent.messages.length, 40);
  const older = await data(owner, thread.GET, "GET", undefined, { id }, "?before=" + recent.next);
  assert.equal(older.messages.length, 4);
  assert.equal(older.messages[0].text, "Hi sitter");
  assert.equal((await prisma.booking.findUnique({ where: { booking_id: BigInt(1) }, select: { status: true } })).status, "pending");

  await prisma.booking.update({ where: { booking_id: BigInt(1) }, data: { sitter_id: BigInt(2) } });
  assert.equal((await invoke(sitter, thread.GET, "GET", undefined, { id })).status, 404);
  assert.equal((await invoke(owner, thread.GET, "GET", undefined, { id })).status, 404);
  assert.notEqual((await data(owner, inbox.POST, "POST", { bookingId: "1" })).id, id);
});

