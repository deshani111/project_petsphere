"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
  const [showMenu, setShowMenu] = useState(false);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const visibleConversations = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.role} ${conversation.preview} ${conversation.booking ?? ""}`.toLowerCase().includes(search.toLowerCase().trim())), [conversations, search]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setShowMenu(false);
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
    <>
    <div className="flex min-h-[calc(100vh-60px)] min-w-0 flex-1 flex-col bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526]">
        <div className="grid min-h-0 flex-1 md:grid-cols-[205px_minmax(0,1fr)]">
          <aside className="min-h-0 border-r border-[#efdada] bg-[#fff8f7]">
            <div className="border-b border-[#f0e2e0] px-3 py-3"><Link href="/owner/bookings" className="flex items-center gap-2 text-[9px] text-[#625758]">← Messages</Link><label className="mt-3 block"><span className="sr-only">Search messages</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="⌕  Search messages..." className="h-8 w-full rounded-[7px] bg-[#fdeceb] px-2 text-[8px] outline-none placeholder:text-[#a39191] focus:ring-1 focus:ring-[#e9c3c0]" /></label></div>
            <div className="max-h-[calc(100vh-145px)] overflow-y-auto p-2">{visibleConversations.map((conversation) => <button type="button" key={conversation.id} onClick={() => selectConversation(conversation.id)} className={`mb-1.5 w-full rounded-[8px] p-2 text-left transition ${selectedId === conversation.id ? "border border-[#edc5c1] bg-[#f8e5e3]" : "hover:bg-[#fcefed]"}`}><div className="flex gap-2"><span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9c29e] text-[9px] font-bold text-[#795349]">{conversation.initials}<i className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${conversation.online ? "bg-[#21b573]" : "bg-[#bcaeae]"}`} /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-1"><strong className="truncate text-[9px]">{conversation.name}</strong><small className="shrink-0 text-[7px] text-[#8a7777]">{conversation.timestamp}</small></span><small className="block text-[6px] font-bold uppercase text-[#A13D3F]">{conversation.role}</small><span className="mt-1 block truncate text-[8px] text-[#766a6b]">{conversation.preview}</span>{conversation.booking && <small className="mt-1 block text-[6px] font-bold text-[#168866]">● {conversation.booking}</small>}</span>{conversation.unread ? <span className="self-end grid h-4 w-4 place-items-center rounded-full bg-[#A13D3F] text-[7px] text-white">{conversation.unread}</span> : null}</div></button>)}{visibleConversations.length === 0 && <p className="px-2 py-8 text-center text-[9px] text-[#8a7777]">No conversations found.</p>}</div>
          </aside>
          <section className="relative flex min-h-0 min-w-0 flex-col bg-white">
            {selected ? <><header className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#f0e2e0] px-4"><div className="flex items-center gap-2"><span className="relative grid h-7 w-7 place-items-center rounded-full bg-[#d9c29e] text-[8px] font-bold text-[#795349]">{selected.initials}<i className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-[#21b573]" /></span><div><strong className="block text-[9px]">{selected.name} <small className="ml-1 rounded bg-[#f8d8d1] px-1 text-[6px] text-[#A13D3F]">{selected.role}</small></strong><small className="text-[7px] text-[#21a66d]">{selected.online ? "Online" : "Offline"}</small></div></div><div className="relative"><button type="button" onClick={() => setShowMenu((value) => !value)} className="text-[15px] text-[#817576]">⋮</button>{showMenu && <div className="absolute right-0 top-6 z-10 w-28 rounded-[7px] border border-[#ead7d5] bg-white p-1 shadow-lg"><button type="button" className="block w-full px-2 py-1.5 text-left text-[8px] hover:bg-[#fff0ef]">View Profile</button><button type="button" className="block w-full px-2 py-1.5 text-left text-[8px] hover:bg-[#fff0ef]">Mute Conversation</button></div>}</div></header><div className="min-h-0 flex-1 overflow-y-auto px-5 py-5"><div className="mb-5 text-center"><span className="rounded-full bg-[#fff0ef] px-3 py-1 text-[7px] font-bold text-[#A13D3F]">TODAY</span></div><div className="grid gap-4">{selected.messages.map((message) => <div key={message.id} className={`flex items-end gap-2 ${message.direction === "sent" ? "justify-end" : "justify-start"}`}>{message.direction === "received" && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d9c29e] text-[7px] font-bold text-[#795349]">{selected.initials}</span>}<div className={`max-w-[70%] rounded-[10px] px-3 py-2 text-[9px] leading-[1.45] ${message.direction === "sent" ? "bg-[#A13D3F] text-white" : "bg-[#fcebea] text-[#4f4344]"}`}><p className="m-0">{message.text}</p><small className={`mt-1 block text-[6px] ${message.direction === "sent" ? "text-[#f7d9d7]" : "text-[#927f7f]"}`}>{message.time}</small></div></div>)}</div></div><form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex h-[47px] shrink-0 items-center gap-2 border-t border-[#f0e2e0] bg-[#fffafa] px-3"><button type="button" className="text-[15px] text-[#817576]">⌕</button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 bg-transparent text-[9px] outline-none placeholder:text-[#a39191]" /><button type="button" className="text-[13px] text-[#817576]">☺</button><button type="submit" aria-label="Send message" className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#A13D3F] text-[12px] text-white">➤</button></form></> : <><div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center"><div className="grid h-14 w-14 place-items-center rounded-[12px] bg-[#ffd9d0] text-[28px] text-[#806b6b]">□</div><h1 className="mt-4 text-[16px] font-bold">Select a conversation</h1><p className="mb-0 mt-2 max-w-[250px] text-[9px] leading-[1.5] text-[#817576]">Choose a conversation from the list to start messaging with pet sitters in your network.</p><button type="button" onClick={() => setShowNewMessage(true)} className="mt-5 rounded-[7px] bg-[#A13D3F] px-5 py-2.5 text-[9px] font-bold text-white shadow-[0_4px_9px_rgba(161,61,63,.18)]">▣ New Message</button></div><div className="mb-5 self-center rounded-full border border-[#ead7d5] bg-[#fffafa] px-4 py-2 text-[7px] text-[#817576]">♧ Your messages are end-to-end encrypted for your safety and privacy.</div></>}
          </section>
        </div>
    </div>
      {showNewMessage && <div className="fixed inset-0 z-20 grid place-items-center bg-black/20 p-4"><div className="w-full max-w-[280px] rounded-[12px] bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><h2 className="m-0 text-[13px] font-bold">New Message</h2><button type="button" onClick={() => setShowNewMessage(false)} className="text-[16px] text-[#817576]">×</button></div><p className="mt-2 text-[9px] text-[#817576]">Choose a contact to start a conversation.</p><div className="mt-3 grid gap-2">{conversations.slice(0, 4).map((conversation) => <button type="button" key={conversation.id} onClick={() => createConversation(conversation)} className="flex items-center gap-2 rounded-[7px] bg-[#fff8f7] p-2 text-left hover:bg-[#fcefed]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#d9c29e] text-[8px] font-bold text-[#795349]">{conversation.initials}</span><span className="text-[9px] font-semibold">{conversation.name}</span></button>)}</div></div></div>}
    </>
  );
}
