"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PaymentStatus = "Paid" | "Pending" | "Refunded";

const transactions: Array<{ date: string; description: string; method: string; reference: string; amount: string; status: PaymentStatus; invoice: string }> = [
  { date: "Oct 24, 2024", description: "Overnight Sitting: Sarah Mitchell", method: "Visa ending in", reference: "4242", amount: "Rs. 4,500.00", status: "Paid", invoice: "INV-024" },
  { date: "Oct 22, 2024", description: "Grooming: Luxury Spa Package", method: "Visa ending in", reference: "4242", amount: "Rs. 2,000.00", status: "Paid", invoice: "INV-023" },
  { date: "Oct 18, 2024", description: "Monthly Pet Insurance Premium", method: "Auto-Pay", reference: "(NCH)", amount: "Rs. 1,000.00", status: "Pending", invoice: "INV-022" },
  { date: "Oct 15, 2024", description: "30-Min Dog Walk: Marcus Reed", method: "Visa ending in", reference: "4242", amount: "Rs. 500.00", status: "Paid", invoice: "INV-021" },
  { date: "Oct 10, 2024", description: "Training Session (Cancelled)", method: "Visa ending in", reference: "4242", amount: "Rs. 3,000.00", status: "Refunded", invoice: "INV-020" },
  { date: "Oct 05, 2024", description: "Premium Membership Annual", method: "Amex ending in", reference: "1005", amount: "Rs. 4,500.00", status: "Paid", invoice: "INV-019" },
  { date: "Sep 28, 2024", description: "Emergency Vet Consult (Online)", method: "Visa ending in", reference: "4242", amount: "Rs. 1,000.00", status: "Paid", invoice: "INV-018" },
  { date: "Sep 21, 2024", description: "Boarding Deposit: Cooper", method: "Visa ending in", reference: "4242", amount: "Rs. 5,000.00", status: "Paid", invoice: "INV-017" },
];

const navItems = ["Dashboard", "My Pets", "Find a Sitter", "My Bookings", "Messages", "Marketplace", "Blogs", "My Profile"];
const pageSize = 5;

function PawMark() {
  return <span className="grid h-[17px] w-[17px] place-items-center rounded-[5px] bg-[#A13D3F] text-[9px] text-white">♥</span>;
}

export default function PaymentHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const openInvoice = (event: MouseEvent) => {
      const element = event.target as Element;
      const button = element.closest<HTMLButtonElement>('button[aria-label^="Download INV-"]');

      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      const invoiceId = button.getAttribute("aria-label")?.replace("Download ", "");

      if (invoiceId) {
        window.location.assign(`/owner/payments/${invoiceId}`);
      }
    };

    document.addEventListener("click", openInvoice, true);
    return () => document.removeEventListener("click", openInvoice, true);
  }, []);
  const visibleTransactions = useMemo(() => transactions.filter((transaction) => statusFilter === "All" || transaction.status === statusFilter), [statusFilter]);
  const pageCount = Math.max(1, Math.ceil(visibleTransactions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const currentTransactions = visibleTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeFilter(value: PaymentStatus | "All") {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526] md:flex">
      <aside className="hidden min-h-screen w-[250px] shrink-0 flex-col border-r border-[#efdada] bg-white px-4 pb-6 pt-7 md:flex">
        <Link href="/" className="flex items-start gap-2 px-2 pb-8 text-[21px] font-bold leading-none text-[#A13D3F]"><PawMark /><span>Pet<span>Sphere</span><small className="mt-2 block text-[7px] font-medium tracking-[.55px] text-[#594d4e]">PET CARE PLATFORM</small></span></Link>
        <nav className="grid gap-2" aria-label="Owner navigation">{navItems.map((item) => <Link key={item} href={item === "Find a Sitter" ? "/owner/bookings/new" : item === "My Bookings" ? "/owner/bookings" : "#"} className={`flex h-10 items-center gap-3 rounded-[7px] px-3 text-[12px] ${item === "My Bookings" ? "bg-[#A13D3F] font-bold text-white shadow-[0_4px_10px_rgba(161,61,63,.14)]" : "text-[#625758] hover:bg-[#fff4f2]"}`}><span className="w-4 text-[16px]">{item === "My Bookings" ? "▣" : "▦"}</span>{item}</Link>)}</nav>
        <Link href="/" className="mt-auto flex gap-3 border-t border-[#ead7d6] px-2 pt-5 text-[12px] text-[#625758]">⇥ <span>Logout</span></Link>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex h-[64px] items-center justify-end border-b border-[#efdada] bg-white px-6 md:px-10"><div className="flex items-center gap-3 text-[#302a2a]"><span className="mr-4 hidden text-[15px] text-[#A13D3F] sm:inline">♧</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f607a] text-[9px] text-white">JP</span><strong className="hidden text-[11px] sm:block">John Perera</strong></div></header>

        <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-10 md:py-11">
          <div className="mb-7"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#A13D3F]">Owner dashboard</p><h1 className="m-0 text-[26px] font-bold tracking-[-1px]">Payment History</h1><p className="mb-0 mt-2 text-[12px] text-[#7c7071]">Review your recent payments, refunds, and invoices.</p></div>
          <section className="rounded-[14px] border border-[#efdcda] bg-white shadow-[0_4px_22px_rgba(68,38,39,.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e2e0] px-4 py-4 md:px-5"><h2 className="m-0 text-[14px] font-bold">Recent Transactions</h2><label className="flex items-center gap-2 text-[10px] text-[#74696a]"><span>Filter</span><select value={statusFilter} onChange={(event) => changeFilter(event.target.value as PaymentStatus | "All")} className="rounded-[7px] border border-[#ead7d5] bg-[#fffafa] px-2 py-1.5 text-[10px] outline-none focus:border-[#A13D3F]"><option>All</option><option>Paid</option><option>Pending</option><option>Refunded</option></select></label></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-b border-[#f0e2e0] text-[9px] uppercase tracking-[.08em] text-[#9b8e8f]"><th className="px-4 py-3 font-semibold md:px-5">Date</th><th className="px-4 py-3 font-semibold">Description</th><th className="px-4 py-3 font-semibold">Payment Method</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-center font-semibold md:px-5">Invoice</th></tr></thead><tbody>{currentTransactions.map((transaction) => <tr key={transaction.invoice} className="border-b border-[#f7eceb] last:border-0 hover:bg-[#fffafa]"><td className="px-4 py-3 text-[10px] text-[#5f5354] md:px-5">{transaction.date}</td><td className="px-4 py-3"><strong className="block max-w-[175px] text-[10px] font-semibold">{transaction.description}</strong></td><td className="px-4 py-3"><span className="block text-[9px] text-[#5f5354]">▰ {transaction.method}</span><small className="ml-3 text-[8px] text-[#9b8e8f]">{transaction.reference}</small></td><td className="px-4 py-3 text-[10px] font-semibold text-[#4f4344]">{transaction.amount}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[8px] font-bold ${transaction.status === "Paid" ? "bg-[#e2f6ed] text-[#168866]" : transaction.status === "Pending" ? "bg-[#fce8e6] text-[#bd5859]" : "bg-[#efedec] text-[#777071]"}`}>● {transaction.status}</span></td><td className="px-4 py-3 text-center md:px-5"><button type="button" onClick={() => window.alert(`Invoice ${transaction.invoice} is ready to download.`)} aria-label={`Download ${transaction.invoice}`} className="text-[15px] text-[#A13D3F] hover:text-[#7c2d30]">▧</button></td></tr>)}{currentTransactions.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-[11px] text-[#918485]">No transactions match this filter.</td></tr>}</tbody></table></div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-[10px] text-[#8c8081] md:px-5"><span>Showing {currentTransactions.length} of {visibleTransactions.length} transactions</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-7 w-7 place-items-center rounded-full border border-[#ead7d5] text-[#A13D3F] disabled:cursor-not-allowed disabled:opacity-40">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} className={`grid h-7 w-7 place-items-center rounded-[6px] ${currentPage === number ? "bg-[#A13D3F] text-white" : "text-[#75696a] hover:bg-[#fff0ef]"}`}>{number}</button>)}<button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid h-7 w-7 place-items-center rounded-full border border-[#ead7d5] text-[#A13D3F] disabled:cursor-not-allowed disabled:opacity-40">›</button></div></div>
          </section>
        </div>
      </section>
    </main>
  );
}
