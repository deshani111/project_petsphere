"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessageSquare, Plus, Send, X } from "lucide-react";
import styles from "../../components/messaging/inbox.module.css";

type Message = { id: string; text: string; direction: "sent" | "received"; time: string };
type Conversation = {
  id: string;
  name: string;
  initials: string;
  role: "OWNER" | "SITTER";
  online: boolean;
  timestamp: string;
  preview: string;
  booking?: string;
  unread?: number;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  { id: "sarah", name: "Sarah Jenkins", initials: "SJ", role: "OWNER", online: true, timestamp: "2h ago", preview: "Can we extend the walk by 15 mins...", booking: "BOOKING #8821", unread: 2, messages: [{ id: "s1", text: "Hi Sarah! I just wanted to check if you're still available for the boarding next week? Cooper is very excited to see you again!", direction: "sent", time: "10:24 AM" }, { id: "s2", text: "Hi Alex! Absolutely. I'm all set for Cooper. I've blocked out those dates in my calendar.", direction: "received", time: "10:28 AM" }] },
  { id: "marcus", name: "Marcus Thorne", initials: "MT", role: "SITTER", online: true, timestamp: "1h ago", preview: "The photos of Bella look amazing! Thank...", messages: [{ id: "m1", text: "The photos of Bella look amazing! Thank you for sending them.", direction: "received", time: "11:05 AM" }] },
  { id: "elena", name: "Elena Rodriguez", initials: "ER", role: "OWNER", online: false, timestamp: "Yesterday", preview: "Confirmed the boarding for next weekend.", messages: [{ id: "e1", text: "Confirmed the boarding for next weekend.", direction: "received", time: "Yesterday" }] },
  { id: "james", name: "James K.", initials: "JK", role: "OWNER", online: false, timestamp: "Mon", preview: "Where is the spare key located again? I'll...", messages: [{ id: "j1", text: "Where is the spare key located again? I'll be there soon.", direction: "received", time: "Mon" }] },
  { id: "sophie", name: "Sophie W.", initials: "SW", role: "OWNER", online: true, timestamp: "3h ago", preview: "Is Luna okay with other cats?", booking: "BOOKING #8845", unread: 1, messages: [{ id: "so1", text: "Is Luna okay with other cats?", direction: "received", time: "9:45 AM" }] },
  { id: "liam", name: "Liam M.", initials: "LM", role: "OWNER", online: false, timestamp: "5h ago", preview: "Just dropped off Cooper at the park.", messages: [{ id: "l1", text: "Just dropped off Cooper at the park.", direction: "received", time: "7:40 AM" }] },
  { id: "olivia", name: "Olivia R.", initials: "OR", role: "OWNER", online: false, timestamp: "6h ago", preview: "Thanks for the update on the feeding!", messages: [{ id: "o1", text: "Thanks for the update on the feeding!", direction: "received", time: "Yesterday" }] },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const visibleConversations = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.role} ${conversation.preview} ${conversation.booking ?? ""}`.toLowerCase().includes(search.toLowerCase().trim())), [conversations, search]);

  const messageArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = messageArea.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [selectedId, selected?.messages.length]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setDraft("");
    setConversations((items) => items.map((conversation) => conversation.id === id ? { ...conversation, unread: 0 } : conversation));
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || !selected) return;
    const message = { id: `${selected.id}-${Date.now()}`, text, direction: "sent" as const, time: "Now" };
    setConversations((items) => items.map((conversation) => conversation.id === selected.id ? { ...conversation, preview: text, timestamp: "Now", messages: [...conversation.messages, message] } : conversation));
    setDraft("");
  }

  function createConversation(conversation: Conversation) {
    setConversations((items) => items.some((item) => item.id === conversation.id) ? items : [conversation, ...items]);
    setShowNewMessage(false);
    selectConversation(conversation.id);
  }

  return (
    <main className={styles.workspace}>
      <h1 className={styles.workspaceHeading}>Messages</h1>
      <p className={styles.workspaceDescription}>Keep in touch about your pet&apos;s care.</p>
      <div className={styles.page}>
        <aside className={styles.inbox + (selected ? " " + styles.inboxWithActive : "")}>
          <div className={styles.inboxHeader}>
            <h2 className={styles.inboxTitle}>
              Inbox
              <button type="button" className={styles.newButton} onClick={() => { setShowNewMessage(true); setSearch(""); }}>
                <Plus size={16} aria-hidden="true" /> New message
              </button>
            </h2>

          </div>
          {showNewMessage ? (
            <div className={styles.recipientPicker}>
              <div className={styles.pickerTitle}>
                Choose a contact
                <button type="button" className={styles.iconButton} onClick={() => { setShowNewMessage(false); setSearch(""); }} aria-label="Close contact picker"><X size={18} /></button>
              </div>
              {visibleConversations.map((conversation) => (
                <button key={conversation.id} type="button" className={styles.contact} onClick={() => { setSearch(""); createConversation(conversation); }}>
                  <span className={styles.personAvatar} aria-hidden="true">{conversation.initials}</span>
                  <strong>{conversation.name}</strong>
                </button>
              ))}
              {!visibleConversations.length && <p className={styles.empty}>No contacts found.</p>}
            </div>
          ) : (
            <div className={styles.conversationList}>
              {visibleConversations.map((conversation) => (
                <button type="button" key={conversation.id} onClick={() => selectConversation(conversation.id)} aria-pressed={selectedId === conversation.id} className={styles.conversation + (selectedId === conversation.id ? " " + styles.selected : "")}>
                  <span className={styles.personAvatar} aria-hidden="true">{conversation.initials}</span>
                  <span className={styles.conversationCopy}>
                    <span className={styles.conversationTop}><strong>{conversation.name}</strong><time>{conversation.timestamp}</time></span>
                    <small>{conversation.preview}</small>
                    {conversation.booking && <small className={styles.booking}>{conversation.booking}</small>}
                  </span>
                  {!!conversation.unread && <span className={styles.unread} aria-label={conversation.unread + " unread"}>{conversation.unread}</span>}
                </button>
              ))}
              {!visibleConversations.length && <p className={styles.empty}>No conversations found.</p>}
            </div>
          )}
        </aside>
        <section aria-label="Conversation" className={styles.chat + (selected ? " " + styles.chatActive : "")}>
          {selected ? (
            <>
              <header className={styles.chatHeader}>
                <button type="button" className={styles.iconButton + " " + styles.backButton} onClick={() => setSelectedId(null)} aria-label="Back to inbox"><ArrowLeft size={20} /></button>
                <span className={styles.personAvatar} aria-hidden="true">{selected.initials}</span>
                <div><strong>{selected.name}</strong><small>{selected.role === "SITTER" ? "Pet sitter" : "Pet owner"} · {selected.online ? "Online" : "Offline"}</small></div>
              </header>
              <div ref={messageArea} className={styles.messageArea}>
                <div className={styles.messageStream}>
                  {selected.booking && <p className={styles.dayLabel}>{selected.booking}</p>}
                  {selected.messages.map((message) => (
                    <article key={message.id} className={message.direction === "sent" ? styles.sent : styles.received}>
                      <p>{message.text}</p><time>{message.time}</time>
                    </article>
                  ))}
                </div>
              </div>
              <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
                <input aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" />
                <button type="submit" className={styles.sendButton} disabled={!draft.trim()} aria-label="Send message"><Send size={18} aria-hidden="true" /></button>
              </form>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><MessageSquare size={24} aria-hidden="true" /></span>
              <h2>Select a conversation</h2>
              <p>Choose a conversation from your inbox or start a new message.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
