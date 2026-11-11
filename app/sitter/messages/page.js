import { Suspense } from "react";
import MessagingInbox from "../../../components/messaging/inbox";

export default function MessagesPage() {
  return <Suspense fallback={<p className="p-6 text-sm">Loading messages…</p>}><MessagingInbox role="sitter" /></Suspense>;
}
