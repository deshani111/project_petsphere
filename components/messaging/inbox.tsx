"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, CheckCheck, FileText, MessageSquare, Paperclip, Plus, Send, X } from "lucide-react";
import styles from "./inbox.module.css";

type Role = "owner" | "sitter";
type Person = { id: string; name: string; avatar: string | null };
type Booking = { id: string; pet: string; service: string | null; start: string | null; end: string | null };
type Conversation = Person & { booking: Booking | null; updatedAt: string };
type InboxRow = Conversation & { preview: string; unread: number };
type Attachment = { id: string; name: string; type: string; size: number };
type Message = { id: string; text: string | null; mine: boolean; seen: boolean; sentAt: string; attachments: Attachment[] };
type History = { conversation: Conversation; messages: Message[]; next: string | null; seenThrough: string | null };
const limit = 3 * 1024 * 1024;
const accept = ".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt";
const isoTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const dateLabel = (value: string) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong.";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch("/api/messages" + path, { cache: "no-store", ...options });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.message || "Messaging is unavailable. Try again.");
  return data;
}
function post(data: object, method = "POST") {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}
function announceUnread(unread?: number) {
  window.dispatchEvent(new CustomEvent("petsphere:messages", { detail: unread }));
}
function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  const [failed, setFailed] = useState<string | null>(null);
  const allowed = avatar && /^(https:\/\/|\/(?!\/))/i.test(avatar) && avatar !== failed;
  return <span aria-hidden="true" className={styles.personAvatar}>{allowed
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={avatar} alt="" referrerPolicy="no-referrer" onError={() => setFailed(avatar)} />
    : name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>;
}

export default function MessagingInbox({ role }: { role: Role }) {
  const router = useRouter();
  const query = useSearchParams();
  const id = query.get("conversation");
  const base = "/" + role + "/messages";
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Person[] | null>(null);
  const [picking, setPicking] = useState(false);
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const paged = useRef(false);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const source = new EventSource("/api/messages/events");
    let last = "";
    source.onmessage = ({ data }) => {
      if (last === data) return;
      last = data;
      announceUnread(JSON.parse(data).unread);
      refresh();
    };
    const timer = window.setInterval(() => {
      if (source.readyState !== EventSource.OPEN && document.visibilityState === "visible") refresh();
    }, 12000);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { source.close(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  useEffect(() => {
    const abort = new AbortController();
    api<{ conversations: InboxRow[]; next: string | null }>("", { signal: abort.signal }).then((result) => {
      setRows((old) => paged.current
        ? [...result.conversations, ...old.filter((row) => !result.conversations.some((item) => item.id === row.id))]
        : result.conversations);
      if (!paged.current) setNext(result.next);
    }).catch((failure) => { if (!abort.signal.aborted) setError(errorText(failure)); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [revision]);

  function choose(conversationId: string) {
    setPicking(false);
    router.push(base + "?conversation=" + encodeURIComponent(conversationId));
  }
  async function openContact(contact: Person) {
    setWorking(true); setError("");
    try {
      const result = await api<{ id: string }>("", post(role === "owner" ? { sitterId: contact.id } : { ownerUserId: contact.id }));
      choose(result.id); refresh();
    } catch (failure) { setError(errorText(failure)); }
    finally { setWorking(false); }
  }
  async function showContacts() {
    setPicking(true); setError("");
    try { setContacts((await api<{ contacts: Person[] }>("/contacts")).contacts); }
    catch (failure) { setError(errorText(failure)); setContacts([]); }
  }
  async function loadOlderConversations() {
    if (!next) return;
    setWorking(true); setError("");
    try {
      const result = await api<{ conversations: InboxRow[]; next: string | null }>("?before=" + encodeURIComponent(next));
      paged.current = true;
      setRows((old) => [...old, ...result.conversations.filter((item) => !old.some((row) => row.id === item.id))]);
      setNext(result.next);
    } catch (failure) { setError(errorText(failure)); }
    finally { setWorking(false); }
  }

  return (
    <main className={styles.workspace}>
      <h1 className={styles.workspaceHeading}>Messages</h1>
      <p className={styles.workspaceDescription}>{role === "owner" ? "Keep in touch about your pet’s care." : "Stay in touch with pet owners about their bookings."}</p>
      <div className={styles.page}>
        <aside className={styles.inbox + (id ? " " + styles.inboxWithActive : "")}>
          <div className={styles.inboxHeader}>
            <h2 className={styles.inboxTitle}>Inbox
              <button type="button" className={styles.newButton} onClick={() => void showContacts()}><Plus size={16} aria-hidden="true" /> New message</button>
            </h2>
          </div>
          {picking ? <div className={styles.recipientPicker}>
            <div className={styles.pickerTitle}>Choose a {role === "owner" ? "sitter" : "pet owner"}
              <button type="button" className={styles.iconButton} onClick={() => setPicking(false)} aria-label="Close contact picker"><X size={18} /></button>
            </div>
            {!contacts && <p className={styles.empty} role="status">Loading contacts…</p>}
            {contacts?.map((person) => <button key={person.id} type="button" disabled={working} className={styles.contact} onClick={() => void openContact(person)}><Avatar {...person} /><strong>{person.name}</strong></button>)}
            {contacts?.length === 0 && <p className={styles.empty}>No contacts available.</p>}
          </div> : <div className={styles.conversationList}>
            {loading && <p className={styles.empty} role="status">Loading messages…</p>}
            {rows.map((row) => <button key={row.id} type="button" aria-pressed={row.id === id} className={styles.conversation + (row.id === id ? " " + styles.selected : "")} onClick={() => choose(row.id)}>
              <Avatar {...row} />
              <span className={styles.conversationCopy}>
                <span className={styles.conversationTop}><strong>{row.name}</strong><time dateTime={row.updatedAt}>{dateLabel(row.updatedAt)}</time></span>
                <small>{row.preview}</small>
                {row.booking && <small className={styles.booking}>Booking #{row.booking.id} · {row.booking.pet}</small>}
              </span>
              {row.unread > 0 && <span className={styles.unread} aria-label={row.unread + " unread"}>{row.unread}</span>}
            </button>)}
            {!loading && !rows.length && !error && <p className={styles.empty}>No conversations yet.</p>}
            {next && <button type="button" className={styles.historyButton} disabled={working} onClick={() => void loadOlderConversations()}>More conversations</button>}
          </div>}
          {error && <p className={styles.error} role="alert">{error} <button type="button" onClick={() => { setError(""); refresh(); }}>Retry</button></p>}
        </aside>
        {id ? <Thread key={id} id={id} role={role} revision={revision} refresh={refresh} back={() => router.push(base)} />
          : <section className={styles.chat} aria-label="Conversation"><div className={styles.emptyState}>
            <span className={styles.emptyIcon}><MessageSquare size={24} aria-hidden="true" /></span>
            <h2>Select a conversation</h2><p>Choose a conversation from your inbox or start a new message.</p>
          </div></section>}
      </div>
    </main>
  );
}

function DraftImage({ file }: { file: File }) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (image.current) image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={image} alt="" />;
}
function messageMerge(old: Message[], incoming: Message[], seenThrough: string | null) {
  const entries = new Map(old.map((message) => [message.id, message]));
  incoming.forEach((message) => entries.set(message.id, message));
  return Array.from(entries.values()).sort((a, b) => BigInt(a.id) < BigInt(b.id) ? -1 : 1)
    .map((message) => message.mine && seenThrough && BigInt(message.id) <= BigInt(seenThrough) ? { ...message, seen: true } : message);
}

function Thread({ id, role, revision, refresh, back }: { id: string; role: Role; revision: number; refresh: () => void; back: () => void }) {
  const path = "/" + encodeURIComponent(id);
  const [thread, setThread] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [older, setOlder] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const scroll = useRef<HTMLDivElement>(null);
  const filePicker = useRef<HTMLInputElement>(null);
  const latest = useRef<string | null>(null);
  const readThrough = useRef<string | null>(null);
  const following = useRef(true);
  const retry = useRef<string | null>(null);
  const newest = messages.at(-1)?.id;
  const lastUnread = messages.findLast((message) => !message.mine && !message.seen)?.id;

  useEffect(() => {
    const abort = new AbortController();
    async function sync() {
      const initial = latest.current === null;
      let cursor = latest.current;
      do {
        const data: History = await api<History>(path + (cursor ? "?after=" + cursor : ""), { signal: abort.signal });
        if (abort.signal.aborted) return;
        setThread(data.conversation);
        setMessages((old) => messageMerge(old, data.messages, data.seenThrough));
        if (initial && !cursor) setOlder(data.next);
        latest.current = data.messages.at(-1)?.id ?? latest.current;
        cursor = initial ? null : data.next;
      } while (cursor);
    }
    void sync().catch((failure) => { if (!abort.signal.aborted) setError(errorText(failure)); });
    return () => abort.abort();
  }, [path, revision]);

  const markVisible = useCallback(() => {
    const panel = scroll.current;
    if (!panel || !lastUnread || !panel.getClientRects().length || document.visibilityState !== "visible" ||
        panel.scrollHeight - panel.scrollTop - panel.clientHeight > 20 || readThrough.current === lastUnread) return;
    readThrough.current = lastUnread;
    void api(path, post({ through: lastUnread }, "PATCH")).then(() => {
      setMessages((old) => old.map((message) => !message.mine && BigInt(message.id) <= BigInt(lastUnread) ? { ...message, seen: true } : message));
      announceUnread(); refresh();
    }).catch(() => { readThrough.current = null; });
  }, [lastUnread, path, refresh]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const panel = scroll.current;
      if (panel && following.current) panel.scrollTop = panel.scrollHeight;
      markVisible();
    });
    document.addEventListener("visibilitychange", markVisible);
    return () => { window.cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", markVisible); };
  }, [newest, markVisible]);

  async function loadOlder() {
    if (!older) return;
    following.current = false;
    setLoadingOlder(true); setError("");
    const panel = scroll.current;
    const previousHeight = panel?.scrollHeight ?? 0;
    const previousTop = panel?.scrollTop ?? 0;
    try {
      const data = await api<History>(path + "?before=" + older);
      setMessages((old) => messageMerge(old, data.messages, data.seenThrough));
      setOlder(data.next);
      window.requestAnimationFrame(() => { if (panel) panel.scrollTop = panel.scrollHeight - previousHeight + previousTop; });
    } catch (failure) { setError(errorText(failure)); }
    finally { setLoadingOlder(false); }
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (sending || (!draft.trim() && !files.length)) return;
    setSending(true); setError("");
    const clientId = retry.current ?? crypto.randomUUID();
    retry.current = clientId;
    try {
      const form = new FormData();
      form.set("clientId", clientId);
      form.set("text", draft);
      files.forEach((file) => form.append("files", file));
      const result = await api<{ message: Message }>(path, files.length ? { method: "POST", body: form } : post({ clientId, text: draft }));
      following.current = true;
      setMessages((old) => messageMerge(old, [result.message], null));
      retry.current = null; setDraft(""); setFiles([]); refresh();
    } catch (failure) { setError(errorText(failure)); }
    finally { setSending(false); }
  }

  return <section aria-label="Conversation" className={styles.chat + " " + styles.chatActive}>
    <header className={styles.chatHeader}>
      <button type="button" className={styles.iconButton + " " + styles.backButton} onClick={back} aria-label="Back to inbox"><ArrowLeft size={20} /></button>
      {thread ? <><Avatar {...thread} /><div><strong>{thread.name}</strong><small>{role === "owner" ? "Pet sitter" : "Pet owner"}</small></div></> : <strong>Conversation</strong>}
    </header>
    {thread?.booking && <div className={styles.bookingContext}>
      <Link href={(role === "owner" ? "/owner/bookings/" : "/sitter/bookings/") + thread.booking.id}>Booking #{thread.booking.id}</Link>
      <span>{[thread.booking.pet, thread.booking.service, [thread.booking.start, thread.booking.end === thread.booking.start ? null : thread.booking.end].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}</span>
    </div>}
    <div className={styles.messageArea} ref={scroll} onScroll={(event) => {
      const panel = event.currentTarget;
      following.current = panel.scrollHeight - panel.scrollTop - panel.clientHeight <= 20;
      markVisible();
    }}>
      {older && <button type="button" disabled={loadingOlder} className={styles.historyButton} onClick={() => void loadOlder()}>{loadingOlder ? "Loading…" : "Load earlier messages"}</button>}
      <div className={styles.messageStream}>
        {messages.map((message, index) => <div className={styles.messageRow} key={message.id}>
          {(index === 0 || dateLabel(message.sentAt) !== dateLabel(messages[index - 1].sentAt)) && <p className={styles.dayLabel}>{dateLabel(message.sentAt)}</p>}
          <article className={message.mine ? styles.sent : styles.received}>
            {message.text && <p>{message.text}</p>}
            {message.attachments.map((file) => {
              const url = "/api/messages" + path + "/attachments/" + file.id;
              return file.type.startsWith("image/") ? <a key={file.id} href={url} target="_blank" rel="noreferrer" className={styles.imageAttachment} aria-label={"Open " + file.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={file.name} loading="lazy" onLoad={() => { const panel = scroll.current; if (panel && following.current) panel.scrollTop = panel.scrollHeight; markVisible(); }} />
              </a> : <a key={file.id} className={styles.fileAttachment} href={url + "?download=1"} download={file.name}><FileText size={19} aria-hidden="true" />
                <span><strong>{file.name}</strong><small>{file.name.split(".").at(-1)?.toUpperCase()} · {Math.max(1, Math.ceil(file.size / 1024))} KB · Download</small></span>
              </a>;
            })}
            <div className={styles.messageMeta}><time dateTime={message.sentAt}>{isoTime(message.sentAt)}</time>
              {message.mine && <span>{message.seen ? <CheckCheck size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}{message.seen ? "Seen" : "Sent"}</span>}
            </div>
          </article>
        </div>)}
      </div>
      {!messages.length && !error && <p className={styles.noMessages}>{thread ? "No messages yet. Say hello!" : "Loading conversation…"}</p>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {thread && <form onSubmit={send}>
      {files.length > 0 && <div className={styles.draftFiles}>{files.map((file, index) => <div key={file.name + index}>
        {/\.jpe?g$|\.png$|\.webp$/i.test(file.name) ? <DraftImage file={file} /> : <FileText size={18} aria-hidden="true" />}
        <span>{file.name}</span>
        <button type="button" className={styles.iconButton} disabled={sending} onClick={() => { retry.current = null; setFiles((old) => old.filter((_, i) => i !== index)); }} aria-label={"Remove " + file.name}><X size={15} /></button>
      </div>)}</div>}
      <div className={styles.composer}>
        <input hidden type="file" multiple accept={accept} ref={filePicker} onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          event.target.value = "";
          const updated = [...files, ...selected];
          if (updated.length > 5 || updated.reduce((size, file) => size + file.size, 0) > limit) {
            setError("Attach up to five files, 3 MB combined."); return;
          }
          setError(""); retry.current = null; setFiles(updated);
        }} />
        <button type="button" className={styles.iconButton} disabled={sending} aria-label="Attach files" onClick={() => filePicker.current?.click()}><Paperclip size={19} /></button>
        <input aria-label="Message" value={draft} disabled={sending} onChange={(event) => { retry.current = null; setDraft(event.target.value); }} maxLength={2000} placeholder="Write a message…" />
        <button type="submit" className={styles.sendButton} disabled={sending || (!draft.trim() && !files.length)} aria-label={sending ? "Sending message" : "Send message"}>{sending ? "Sending…" : <Send size={18} aria-hidden="true" />}</button>
      </div>
    </form>}
  </section>;
}

