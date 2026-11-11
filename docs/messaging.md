# PetSphere messaging

Both `/owner/messages` and `/sitter/messages` use the same inbox and API. The development-only `/messages-preview` is an isolated sample and does not send real messages.

## Setup

1. Keep the existing PostgreSQL `DATABASE_URL` and authentication configuration (`AUTH_SECRET` in production). Use a development database or branch for the first migration. Back up the target database and confirm its existing Prisma migration history is healthy.
2. From the repository root, inspect and apply the pending migrations, then regenerate the client:

   ```sh
   npx prisma migrate status
   npx prisma migrate deploy
   npm run prisma:generate
   ```

   Do not run the standalone baseline SQL against an existing database; it rebuilds the schema. The new migration is `20261110090000_add_shared_messaging`. It creates conversations and attachment metadata, adds optional message columns and indexes, and backfills existing owner–sitter messages into one direct thread per pair. It does not erase or rewrite message text. Records outside owner–sitter pairs are left in the legacy table.
3. For attachments, configure `MESSAGING_BLOB_READ_WRITE_TOKEN` for a **private** Vercel Blob store on the server. Never prefix it with `NEXT_PUBLIC_`. No new package or store is provisioned by the code. Text messages work without this token. Uploads accept JPG/JPEG, PNG, WebP, PDF, DOCX, and UTF-8 TXT; the limit is five files and 3 MiB total per message. This leaves room below [Vercel’s 4.5 MB request limit](https://vercel.com/docs/functions/limitations).

## API

| Method and route | Operation |
| --- | --- |
| `GET /api/messages?before=<id>` | List conversations ordered by activity, 40 per page |
| `POST /api/messages` | Open or create with `bookingId`, `sitterId` (owner), or `ownerUserId` (sitter) |
| `GET /api/messages/contacts` | List available contacts for the new-message picker |
| `GET /api/messages/:id?before=<id>` | Read the thread and booking context; `after=<id>` fetches newer messages |
| `POST /api/messages/:id` | Send JSON text or multipart text/files with a retry-safe UUID `clientId` |
| `PATCH /api/messages/:id` | Mark incoming messages through the viewed message ID as read |
| `GET /api/messages/:id/attachments/:attachmentId` | Stream a participant-authorized private attachment; `?download=1` forces download |
| `GET /api/messages/unread` | Get total unread messages for the sidebar |
| `GET /api/messages/events` | Authenticated server-sent inbox change signals |

A conversation has two fixed roles, stored as foreign keys. Existing message sender/receiver columns and read flags are reused. A database key deduplicates direct and booking threads; a unique sender/client ID deduplicates message retries. Booking-linked access also checks the current assignment. Creating a conversation or sending a message never changes the booking status. Bookings without an assigned sitter cannot open a booking conversation. The owner confirmation pages accept an authorized real `?bookingId=`; the older sample confirmation path without an ID cannot open a thread.

The inbox stream checks shared PostgreSQL state every three seconds and signals the browser to refresh on a change. It reconnects after a short lease, and the browser falls back to polling when the stream is unavailable. The sender sees the saved response immediately. The sidebar refreshes independently outside the inbox. No external realtime service is required.

Attachments are stored under generated keys. Message and attachment metadata commit together after uploads succeed. Ordinary partial failures clean up unused files; a process crash, ambiguous database commit, or storage outage may leave unreferenced objects. The audit command below lists old, unreferenced objects without deleting them. Review the results against the same database and private store before running with `--delete`.

```sh
node scripts/audit-messaging-attachments.mjs
```

## Verification

```sh
node --test tests/messaging.integration.test.mjs
npx tsc --noEmit
```

The integration suite uses an isolated in-memory PostgreSQL instance from Prisma's bundled local tooling, mocked session identities, and an in-memory private-storage stub. It needs a localhost socket. It never uses the configured database or Blob store. It tests legacy backfill, two-way sends, booking isolation, pagination, read state, streaming, duplicates, attachment access, and partial upload cleanup.

After applying the migration and configuring Blob on a development environment, sign in as an owner and their assigned sitter in separate browser profiles. Open a booking conversation, send and reply, reload, check the unread badges and Seen indicator, and upload/download each supported file type. An unrelated account should get a 404 for the conversation and its attachment links.

