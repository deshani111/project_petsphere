"use client";

import { useState } from "react";
import Link from "next/link";

const checkout = {
  sitter: "Sarah Mitchell",
  rating: "4.9 (124 reviews)",
  pet: "Buddy (Golden Retriever)",
  dates: "July 24 - July 27, 2026",
  subtotal: "Rs.43000.00",
  serviceFee: "Rs.1500.00",
  tax: "Rs.500.00",
  total: "Rs.45000.00",
};

const paymentMethods = [
  { id: "visa", name: "Visa ending in 4242", expiry: "Expires 12/26" },
  { id: "mastercard", name: "Mastercard ending in 8899", expiry: "Expires 08/25" },
];

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState("visa");
  const [paid, setPaid] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526]">
        <div className="mx-auto max-w-[1060px] px-5 py-8 md:px-8 md:py-10">
          <Link href="/owner/bookings/booking-001" className="mb-6 flex items-center gap-2 text-[22px] font-bold tracking-[-.5px] text-[#2d2526]"><span className="text-[26px] font-normal">←</span>Checkout</Link>
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(300px,35fr)_minmax(500px,65fr)]">
            <section className="rounded-[12px] border border-[#f0d5d2] bg-white p-4 shadow-[0_3px_14px_rgba(68,38,39,.03)]">
              <h2 className="m-0 text-[16px] font-bold">Order Summary</h2>
              <div className="mt-4 flex gap-3 rounded-[9px] bg-[#fff0ee] p-3"><div className="grid h-[58px] w-[52px] shrink-0 place-items-center rounded-[5px] bg-[#d9c29e] text-[25px]">👩🏻</div><div><small className="block text-[8px] uppercase text-[#A13D3F]">Service · Boarding</small><strong className="mt-1 block text-[12px]">{checkout.sitter}</strong><span className="text-[9px] text-[#66595a]">★ {checkout.rating}</span></div></div>
              <div className="mt-4 flex justify-between border-b border-[#eadedc] pb-4 text-[9px]"><div><strong className="mb-1 block text-[10px]">♣ Pet</strong><span>{checkout.pet}</span></div><div className="text-right"><strong className="mb-1 block text-[10px]">▣ Dates</strong><span>{checkout.dates}</span></div></div>
              <div className="grid gap-3 py-4 text-[10px] text-[#66595a]"><p className="m-0 flex justify-between"><span>Subtotal</span><span>{checkout.subtotal}</span></p><p className="m-0 flex justify-between"><span>Service Fee</span><span>{checkout.serviceFee}</span></p><p className="m-0 flex justify-between"><span>Tax</span><span>{checkout.tax}</span></p></div>
              <div className="flex items-center justify-between border-t border-[#eadedc] pt-4"><strong className="text-[13px]">Total</strong><strong className="text-[25px] text-[#A13D3F]">{checkout.total}</strong></div>
            </section>

            <section className="rounded-[12px] border border-[#f0d5d2] bg-white p-4 shadow-[0_3px_14px_rgba(68,38,39,.03)]">
              <h2 className="m-0 text-[16px] font-bold">Payment Method</h2>
              <div className="mt-4 grid gap-3">{paymentMethods.map((method) => <button type="button" key={method.id} onClick={() => setSelectedMethod(method.id)} className={`flex min-h-[54px] w-full items-center gap-3 rounded-[8px] border px-3 py-2 text-left ${selectedMethod === method.id ? "border-[#A13D3F] bg-[#fff0ee]" : "border-[#ead7d5] bg-white"}`}><span className={`grid h-4 w-4 place-items-center rounded-full border ${selectedMethod === method.id ? "border-[#A13D3F] bg-[#A13D3F]" : "border-[#bdaaaa]"}`}>{selectedMethod === method.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span><span className="grid h-7 w-8 place-items-center rounded-[4px] bg-[#f0e3e1] text-[13px]">▣</span><span className="flex-1"><strong className="block text-[10px]">{method.name}</strong><small className="text-[9px] text-[#66595a]">{method.expiry}</small></span>{method.id === "visa" && <span className="text-[14px] text-[#A13D3F]">⚙</span>}</button>)}</div>
              <button type="button" className="mt-4 text-[10px] text-[#A13D3F]">⊕ Add new card</button>
              <label className="mt-4 block text-[9px] text-[#66595a]">Card Number<input placeholder="0000 0000 0000 0000" className="mt-1 h-9 w-full rounded-[7px] border border-[#ead7d5] bg-[#fffafa] px-3 text-[10px] outline-none focus:border-[#A13D3F]" /></label>
              <div className="mt-3 grid grid-cols-3 gap-3">{[["Expiry", "MM/YY"], ["CVV", "123"], ["Zip Code", "90210"]].map(([label, placeholder]) => <label key={label} className="text-[9px] text-[#66595a]">{label}<input placeholder={placeholder} className="mt-1 h-9 w-full rounded-[7px] border border-[#ead7d5] bg-[#fffafa] px-3 text-[10px] outline-none focus:border-[#A13D3F]" /></label>)}</div>
              <label className="mt-4 block text-[9px] text-[#66595a]">Promo Code<div className="mt-1 flex gap-3"><input placeholder="Enter code" className="h-9 min-w-0 flex-1 rounded-[7px] border border-[#ead7d5] bg-[#fffafa] px-3 text-[10px] outline-none focus:border-[#A13D3F]" /><button type="button" onClick={() => setPromoApplied(true)} className="rounded-[7px] bg-[#fbd8d1] px-5 text-[10px] text-[#A13D3F]">Apply</button></div></label>
              {promoApplied && <p className="mb-0 mt-2 text-[9px] text-[#168866]">Promo code applied for this mock checkout.</p>}
              <button type="button" onClick={() => setPaid(true)} className="mt-6 h-10 w-full rounded-[7px] bg-[#A13D3F] text-[13px] font-bold text-white shadow-[0_3px_8px_rgba(161,61,63,.18)]">{paid ? "Payment Ready" : `Pay ${checkout.total}`}</button>
              <p className="mb-0 mt-3 text-center text-[9px] text-[#66595a]">♙ Payments are encrypted and secure</p>
            </section>
          </div>
        </div>
    </div>
  );
}
