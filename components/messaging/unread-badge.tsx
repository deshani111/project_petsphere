"use client";

import { useEffect, useState } from "react";

export function UnreadBadge({ disabled = false }: { disabled?: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (disabled) return;
    let version = 0;
    let stopped = false;
    const load = async () => {
      const current = ++version;
      try {
        const response = await fetch("/api/messages/unread", { cache: "no-store" });
        const data = response.ok ? await response.json() : null;
        if (!stopped && current === version) setCount(typeof data?.unread === "number" ? data.unread : 0);
      } catch { /* Keep the last known count during a connection interruption. */ }
    };
    const onUpdate = (event: Event) => {
      const unread = (event as CustomEvent<number | undefined>).detail;
      if (typeof unread === "number") { ++version; setCount(unread); }
      else void load();
    };
    const whenVisible = () => { if (document.visibilityState === "visible") void load(); };
    void load();
    const timer = window.setInterval(whenVisible, 12000);
    window.addEventListener("petsphere:messages", onUpdate);
    document.addEventListener("visibilitychange", whenVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener("petsphere:messages", onUpdate);
      document.removeEventListener("visibilitychange", whenVisible);
    };
  }, [disabled]);
  if (disabled || !count) return null;
  return <span aria-label={count + " unread messages"} className="ml-auto inline-grid min-w-5 shrink-0 place-items-center rounded-full bg-[#9e3339] px-1.5 py-0.5 text-[10px] font-bold text-white ring-1 ring-white">{count > 99 ? "99+" : count}</span>;
}

