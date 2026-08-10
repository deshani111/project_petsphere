"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Search, Send, Plus, X, ChevronLeft, MoreVertical, Smile, PlusCircle } from "lucide-react";
import styles from "./messages.module.css";

const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const relativeDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const days = Math.floor((today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : days < 7 ? `${days}d ago` : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/sitter/messages", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load messages.");
      setConversations(data.conversations || []);
      setActive((current) => current || data.conversations?.[0] || null);
      setContacts(data.contacts || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!active) return;
    setError("");
    fetch(`/api/sitter/messages/${active.userId}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load this conversation.");
        setThread(data.messages || []);
      })
      .catch((err) => setError(err.message));
  }, [active]);

  const visible = useMemo(() => conversations.filter((conversation) => conversation.name.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const newRecipients = useMemo(() => contacts.filter((contact) => contact.name.toLowerCase().includes(search.toLowerCase())), [contacts, search]);

  function chooseConversation(conversation) { setActive(conversation); setNewMessageOpen(false); setSearch(""); }
  async function send(event) {
    event.preventDefault();
    if (!text.trim() || !active || sending) return;
    setSending(true); setError("");
    try {
      const response = await fetch(`/api/sitter/messages/${active.userId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Message could not be sent.");
      setThread((current) => [...current, data.message]);
      setText("");
      load();
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  }

  return <section className={styles.page}>
    <aside className={`${styles.inbox} ${active ? styles.inboxWithActive : ""}`}>
      <div className={styles.inboxTitle}>Messages</div>
      <label className={styles.search}><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={newMessageOpen ? "Search people..." : "Search messages..."} /></label>
      {newMessageOpen ? <div className={styles.recipientPicker}>
        <div className={styles.pickerTitle}><span>New message</span><button onClick={() => setNewMessageOpen(false)} aria-label="Close"><X size={15} /></button></div>
        {newRecipients.map((contact) => <button key={contact.userId} className={styles.contact} onClick={() => chooseConversation(contact)}><span className={styles.personAvatar}>{initials(contact.name)}</span><span><strong>{contact.name}</strong><small>Pet owner</small></span></button>)}
        {!newRecipients.length && <p className={styles.empty}>No pet owners found.</p>}
      </div> : <div className={styles.conversationList}>
        {loading && <p className={styles.empty}>Loading messages…</p>}
        {!loading && visible.map((conversation) => <button key={conversation.userId} onClick={() => chooseConversation(conversation)} className={`${styles.conversation} ${active?.userId === conversation.userId ? styles.selected : ""}`}>
          <span className={styles.personAvatar}>{initials(conversation.name)}</span><span className={styles.conversationCopy}><span className={styles.conversationTop}><strong>{conversation.name}</strong><time>{relativeDate(conversation.sentAt)}</time></span><small>{conversation.preview}</small></span>{conversation.unread > 0 && <em>{conversation.unread}</em>}
        </button>)}
        {!loading && !visible.length && <p className={styles.empty}>No conversations yet.</p>}
      </div>}
    </aside>
    <main className={`${styles.chat} ${active ? styles.chatActive : ""}`}>
      {!active ? <div className={styles.emptyState}>
        <span className={styles.emptyIcon}><MessageSquare size={25} /></span><h1>Select a conversation</h1><p>Choose a conversation from the list to start messaging with pet owners.</p>
        <button className={styles.newButton} onClick={() => { setNewMessageOpen(true); setSearch(""); }}><Plus size={15} /> <span>New</span> Message</button>
      </div> : <>
        <header className={styles.chatHeader}><button className={styles.backButton} onClick={() => setActive(null)} aria-label="Back to messages"><ChevronLeft size={19} /></button><span className={styles.personAvatar}>{initials(active.name)}</span><div><strong>{active.name}</strong><small><i /> Online</small></div><button className={styles.moreButton} aria-label="Conversation options"><MoreVertical size={17} /></button></header>
        <div className={styles.messageArea}>{thread.length ? <><p className={styles.dayLabel}>Today</p>{thread.map((message) => <article key={message.message_id} className={message.sender_id === active.userId ? styles.received : styles.sent}><p>{message.message_text}</p><time>{new Date(message.sent_date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time></article>)}</> : <p className={styles.noMessages}>No messages yet. Say hello to {active.name.split(" ")[0]}.</p>}</div>
        <form className={styles.composer} onSubmit={send}><button type="button" className={styles.addButton} aria-label="Add attachment"><PlusCircle size={16} /></button><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message..." maxLength="2000" /><button type="button" className={styles.emojiButton} aria-label="Choose emoji"><Smile size={16} /></button><button className={styles.sendButton} disabled={!text.trim() || sending} aria-label="Send message"><Send size={16} fill="currentColor" /></button></form>
      </>}
      {error && <p className={styles.error}>{error}</p>}
    </main>
  </section>;
}
