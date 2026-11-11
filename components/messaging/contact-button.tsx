"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function ContactButton({ role, bookingId, sitterId, className, disabled = false, label }: {
  role: "owner" | "sitter"; bookingId?: string; sitterId?: string; className?: string; disabled?: boolean; label?: string;
}) {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  async function open() {
    setWaiting(true); setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingId ? { bookingId } : { sitterId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.id) throw new Error(data?.message || "Could not open the conversation.");
      router.push("/" + role + "/messages?conversation=" + encodeURIComponent(data.id));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not open the conversation."); }
    finally { setWaiting(false); }
  }
  return <span className="inline-flex min-w-0 flex-col">
    <button type="button" disabled={disabled || waiting || (!bookingId && !sitterId)} className={className} onClick={(event) => { event.stopPropagation(); void open(); }}>
      <MessageCircle size={16} aria-hidden="true" /> {waiting ? "Opening…" : label ?? (role === "owner" ? "Contact sitter" : "Contact owner")}
    </button>
    {error && <span role="alert" className="mt-1 max-w-64 text-xs text-[#a13737]">{error}</span>}
  </span>;
}

