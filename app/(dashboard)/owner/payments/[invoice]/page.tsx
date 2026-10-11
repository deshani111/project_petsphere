"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type InvoiceStatus = "Paid" | "Pending" | "Refunded";

interface InvoiceTransaction {
  id: string;
  status: InvoiceStatus;
  issuedOn: string;
  customer: {
    name: string;
    address: string[];
  };
  serviceProvider: {
    name: string;
    initials: string;
    role: string;
  };
  lineItem: {
    description: string;
    pet: string;
    quantity: string;
    unitPrice: string;
    total: string;
  };
  totals: {
    subtotal: string;
    platformFee: string;
    tax: string;
    total: string;
  };
  payment: {
    method: string;
    reference: string;
  };
}

const mockTransactions: Record<string, InvoiceTransaction> = {
  "INV-024": {
    id: "INV-024",
    status: "Paid",
    issuedOn: "Oct 24, 2024",
    customer: { name: "Alex Johnson", address: ["123 Pet Lane", "Austin, TX 78701"] },
    serviceProvider: { name: "Sarah Mitchell", initials: "SM", role: "Certified Sitter" },
    lineItem: {
      description: "Overnight Sitting",
      pet: "Buddy (Golden Retriever)",
      quantity: "3 nights",
      unitPrice: "Rs. 1,500.00",
      total: "Rs. 4,500.00",
    },
    totals: { subtotal: "Rs. 4,500.00", platformFee: "Rs. 500.00", tax: "Rs. 500.00", total: "Rs. 5,500.00" },
    payment: { method: "Visa ending in", reference: "4242" },
  },
  "INV-023": {
    id: "INV-023",
    status: "Paid",
    issuedOn: "Oct 22, 2024",
    customer: { name: "Alex Johnson", address: ["123 Pet Lane", "Austin, TX 78701"] },
    serviceProvider: { name: "PetSphere Grooming", initials: "PG", role: "Certified Groomer" },
    lineItem: {
      description: "Luxury Spa Package",
      pet: "Buddy (Golden Retriever)",
      quantity: "1 service",
      unitPrice: "Rs. 2,000.00",
      total: "Rs. 2,000.00",
    },
    totals: { subtotal: "Rs. 2,000.00", platformFee: "Rs. 0.00", tax: "Rs. 0.00", total: "Rs. 2,000.00" },
    payment: { method: "Visa ending in", reference: "4242" },
  },
  "INV-022": {
    id: "INV-022",
    status: "Pending",
    issuedOn: "Oct 18, 2024",
    customer: { name: "Alex Johnson", address: ["123 Pet Lane", "Austin, TX 78701"] },
    serviceProvider: { name: "PetSphere Insurance", initials: "PI", role: "Pet Insurance" },
    lineItem: {
      description: "Monthly Pet Insurance Premium",
      pet: "Buddy (Golden Retriever)",
      quantity: "1 month",
      unitPrice: "Rs. 1,000.00",
      total: "Rs. 1,000.00",
    },
    totals: { subtotal: "Rs. 1,000.00", platformFee: "Rs. 0.00", tax: "Rs. 0.00", total: "Rs. 1,000.00" },
    payment: { method: "Auto-Pay", reference: "(NCH)" },
  },
  "INV-021": {
    id: "INV-021",
    status: "Paid",
    issuedOn: "Oct 15, 2024",
    customer: { name: "Alex Johnson", address: ["123 Pet Lane", "Austin, TX 78701"] },
    serviceProvider: { name: "Marcus Reed", initials: "MR", role: "Certified Dog Walker" },
    lineItem: {
      description: "30-Min Dog Walk",
      pet: "Buddy (Golden Retriever)",
      quantity: "1 walk",
      unitPrice: "Rs. 500.00",
      total: "Rs. 500.00",
    },
    totals: { subtotal: "Rs. 500.00", platformFee: "Rs. 0.00", tax: "Rs. 0.00", total: "Rs. 500.00" },
    payment: { method: "Visa ending in", reference: "4242" },
  },
  "INV-020": {
    id: "INV-020",
    status: "Refunded",
    issuedOn: "Oct 10, 2024",
    customer: { name: "Alex Johnson", address: ["123 Pet Lane", "Austin, TX 78701"] },
    serviceProvider: { name: "PetSphere Training", initials: "PT", role: "Certified Trainer" },
    lineItem: {
      description: "Training Session (Cancelled)",
      pet: "Buddy (Golden Retriever)",
      quantity: "1 session",
      unitPrice: "Rs. 3,000.00",
      total: "Rs. 3,000.00",
    },
    totals: { subtotal: "Rs. 3,000.00", platformFee: "Rs. 0.00", tax: "Rs. 0.00", total: "Rs. 3,000.00" },
    payment: { method: "Visa ending in", reference: "4242" },
  },
};

const navItems = ["Dashboard", "My Pets", "Find a Sitter", "My Bookings", "Messages", "Marketplace", "Blogs", "My Profile"];

function PawMark() { return <span className="grid h-[17px] w-[17px] place-items-center rounded-[5px] bg-[#A13D3F] text-[9px] text-white">♥</span>; }

export default function InvoicePage() {
  const params = useParams<{ invoice: string }>();
  const invoiceId = decodeURIComponent(params.invoice ?? "INV-024");
  const invoice = mockTransactions[invoiceId] ?? mockTransactions["INV-024"];
  const isPaid = invoice.status === "Paid";

  return (
    <main className="min-h-screen bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526] md:flex">
      <aside className="hidden min-h-screen w-[250px] shrink-0 flex-col border-r border-[#efdada] bg-white px-4 pb-6 pt-7 md:flex"><Link href="/" className="flex items-start gap-2 px-2 pb-8 text-[21px] font-bold leading-none text-[#A13D3F]"><PawMark /><span>Pet<span>Sphere</span><small className="mt-2 block text-[7px] font-medium tracking-[.55px] text-[#594d4e]">PET CARE PLATFORM</small></span></Link><nav className="grid gap-2" aria-label="Owner navigation">{navItems.map((item) => <Link key={item} href={item === "Find a Sitter" ? "/owner/bookings/new" : item === "My Bookings" ? "/owner/bookings" : "#"} className={`flex h-10 items-center gap-3 rounded-[7px] px-3 text-[12px] ${item === "My Bookings" ? "bg-[#A13D3F] font-bold text-white shadow-[0_4px_10px_rgba(161,61,63,.14)]" : "text-[#625758] hover:bg-[#fff4f2]"}`}><span className="w-4 text-[16px]">{item === "My Bookings" ? "▣" : "▦"}</span>{item}</Link>)}</nav><Link href="/" className="mt-auto flex gap-3 border-t border-[#ead7d6] px-2 pt-5 text-[12px] text-[#625758]">⇥ <span>Logout</span></Link></aside>
      <section className="min-w-0 flex-1"><header className="flex h-[64px] items-center justify-end border-b border-[#efdada] bg-white px-6 md:px-10"><div className="flex items-center gap-3 text-[#302a2a]"><span className="mr-4 hidden text-[15px] text-[#A13D3F] sm:inline">♧</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f607a] text-[9px] text-white">JP</span><strong className="hidden text-[11px] sm:block">John Perera</strong></div></header>
        <div className="mx-auto max-w-[850px] px-5 py-8 md:px-10 md:py-11"><Link href="/owner/payments" className="mb-5 inline-block text-[10px] text-[#695d5e] hover:text-[#A13D3F]">← Back to Payments</Link><article className="overflow-hidden rounded-[16px] border border-[#efdcda] bg-white shadow-[0_5px_24px_rgba(68,38,39,.05)]"><header className="flex items-center justify-between border-b border-[#f0e2e0] px-5 py-4"><div className="flex items-center gap-2"><PawMark /><div><strong className="block text-[11px] text-[#A13D3F]">PetSphere</strong><small className="block text-[8px] text-[#877b7c]">{invoice.id}</small></div></div><div className="text-right"><span className={`inline-block rounded-full px-2.5 py-1 text-[8px] font-bold ${isPaid ? "bg-[#dff5eb] text-[#168866]" : invoice.status === "Pending" ? "bg-[#fce8e6] text-[#bd5859]" : "bg-[#efedec] text-[#777071]"}`}>● {invoice.status}</span><small className="mt-1 block text-[8px] text-[#837778]">Issued on {invoice.issuedOn}</small></div></header>
          <div className="p-5"><div className="grid gap-6 border-b border-[#f0e2e0] pb-6 sm:grid-cols-2"><div><small className="text-[8px] uppercase tracking-[.08em] text-[#a09596]">Billed To</small><strong className="mt-2 block text-[11px]">{invoice.customer.name}</strong><p className="m-0 mt-1 text-[9px] leading-[1.5] text-[#766a6b]">{invoice.customer.address.map((line) => <span className="block" key={line}>{line}</span>)}</p></div><div><small className="text-[8px] uppercase tracking-[.08em] text-[#a09596]">Service Provided By</small><div className="mt-2 flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#f6dedb] text-[9px] font-bold text-[#A13D3F]">{invoice.serviceProvider.initials}</span><div><strong className="block text-[10px]">{invoice.serviceProvider.name}</strong><small className="text-[8px] text-[#766a6b]">{invoice.serviceProvider.role}</small></div></div></div></div>
            <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[530px] text-left"><thead><tr className="border-b border-[#eadedc] text-[8px] uppercase text-[#766a6b]"><th className="pb-3 font-semibold">Description</th><th className="pb-3 font-semibold">Quantity</th><th className="pb-3 font-semibold">Unit Price</th><th className="pb-3 text-right font-semibold">Line Total</th></tr></thead><tbody><tr><td className="py-4"><strong className="block text-[10px]">{invoice.lineItem.description}</strong><small className="text-[8px] text-[#837778]">{invoice.lineItem.pet}</small></td><td className="py-4 text-[10px]">{invoice.lineItem.quantity}</td><td className="py-4 text-[10px]">{invoice.lineItem.unitPrice}</td><td className="py-4 text-right text-[10px] font-bold">{invoice.lineItem.total}</td></tr></tbody></table></div>
            <div className="ml-auto mt-5 max-w-[260px] text-[9px]"><p className="mb-2 flex justify-between text-[#75696a]"><span>Subtotal</span><span>{invoice.totals.subtotal}</span></p><p className="mb-2 flex justify-between text-[#75696a]"><span>Platform Fee</span><span>{invoice.totals.platformFee}</span></p><p className="mb-2 flex justify-between text-[#75696a]"><span>Tax</span><span>{invoice.totals.tax}</span></p><p className="flex justify-between border-t border-[#eadedc] pt-2 font-bold text-[#A13D3F]"><span>Total</span><span>{invoice.totals.total}</span></p></div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0e2e0] pt-5"><div className="rounded-[8px] bg-[#fff4f2] px-3 py-2"><small className="block text-[7px] uppercase text-[#877b7c]">Payment Info</small><span className="text-[9px]">▰ Paid via {invoice.payment.method} {invoice.payment.reference}</span></div><div className="flex gap-2"><button type="button" onClick={() => window.print()} className="rounded-[7px] bg-[#f9ded9] px-3 py-2 text-[9px] text-[#A13D3F]">⎙ Print</button><button type="button" onClick={() => window.alert("Your invoice download will begin shortly.")} className="rounded-[7px] bg-[#f9ded9] px-3 py-2 text-[9px] text-[#A13D3F]">⇩ Download PDF</button></div></div></div>
          <footer className="border-t border-[#f0e2e0] px-5 py-3 text-center text-[8px] text-[#877b7c]">For support, contact <span className="text-[#A13D3F]">support@petsphere.com</span>. All services are covered by PetSphere Guarantee.</footer></article><div className="mt-5 text-center text-[32px] text-[#f5c8c4]">♥</div></div>
      </section>
    </main>
  );
}
