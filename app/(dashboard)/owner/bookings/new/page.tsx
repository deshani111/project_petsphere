"use client";

import { useState } from "react";
import Link from "next/link";
import BookingSummary from "./components/booking-summary";

type ServiceId = "boarding" | "walking" | "grooming" | "training";

const services: Array<{ id: ServiceId; name: string; description: string; price: string; unit: string; icon: string }> = [
  { id: "boarding", name: "Boarding", description: "Overnight stay in a cozy home environment with daily updates and personalized care.", price: "8,500.00", unit: "/ night", icon: "⌂" },
  { id: "walking", name: "Walking", description: "A refreshing 60-minute neighborhood walk for exercise and play to keep your pet active.", price: "4,000.00", unit: "/ hour", icon: "♟" },
  { id: "grooming", name: "Grooming", description: "Full spa treatment including bath, hair trim, and nail clipping by professional stylists.", price: "6,000.00", unit: "/ session", icon: "✂" },
  { id: "training", name: "Training", description: "Professional behavioral training sessions for all age groups and breeds to improve obedience.", price: "5,000.00", unit: "/ hour", icon: "◇" },
];

export default function NewBookingPage() {
  const [selectedService, setSelectedService] = useState<ServiceId>("boarding");
  const selected = services.find((service) => service.id === selectedService) ?? services[0];

  return (
    <div className="mx-auto mt-2.5 grid max-w-[747px] grid-cols-1 gap-[15px] px-[14px] pb-6 sm:px-[18px] md:grid-cols-[minmax(420px,1fr)_170px]">
      <section className="min-w-0">
        <h1 className="m-0 text-[19px] font-bold tracking-[-.8px] md:text-[21px]">What service are you looking for?</h1>
        <p className="mb-[18px] mt-1.5 text-[9px] text-[#7c7071]">Select the best care option for your companion.</p>
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          {services.map((service) => {
            const isSelected = service.id === selectedService;
            return <button type="button" key={service.id} onClick={() => setSelectedService(service.id)} className={`relative min-h-[145px] overflow-hidden rounded-[13px] border bg-white p-[14px] text-left text-[#292323] transition hover:border-[#A13D3F] sm:min-h-[163px] ${isSelected ? "border-[#A13D3F] shadow-[inset_0_0_0_1px_#A13D3F]" : "border-[#e9cfcd]"}`} aria-pressed={isSelected}>
              <span className="grid h-[27px] w-[27px] place-items-center rounded-[9px] bg-[#fae6e3] text-[17px] text-[#A13D3F]">{service.icon}</span><span className={`absolute right-2.5 top-2.5 grid h-[15px] w-[15px] place-items-center rounded-full border text-[9px] text-white ${isSelected ? "border-[#A13D3F] bg-[#A13D3F]" : "border-[#DCC0BF]"}`}>{isSelected && "✓"}</span>
              <strong className="mt-3 block text-[11px]">{service.name}</strong><p className="my-[7px] text-[8px] leading-[1.45] text-[#675c5d]">{service.description}</p><b className={`absolute bottom-[13px] text-[10px] ${isSelected ? "text-[#A13D3F]" : ""}`}>Rs.{service.price}<em className="ml-[3px] text-[7px] font-normal not-italic text-[#6d6263]">{service.unit}</em></b>
            </button>;
          })}
        </div>
        <div className="mt-[15px] flex items-center justify-between px-[18px]"><Link href="/owner/bookings" className="text-[9px] text-[#675c5d]">Cancel</Link><Link href="/owner/bookings/new/pet" className="rounded-[8px] bg-[#A13D3F] px-4 py-[9px] text-[9px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]">Next <span className="ml-[5px] text-[13px]">→</span></Link></div>
      </section>
      <BookingSummary service={selected.name} price={selected.price} unit={selected.unit} />
    </div>
  );
}
