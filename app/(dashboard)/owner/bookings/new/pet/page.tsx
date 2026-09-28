"use client";

import { useState } from "react";
import Link from "next/link";
import BookingSummary from "../components/booking-summary";

const pets = [
  { id: "charlie", name: "Cooper", details: "Beagle • 4 Years", image: "/marketplace-cooper.jpg" },
  { id: "luna", name: "Luna", details: "Siamese • 2 Years", image: "/marketplace-luna.jpg" },
  { id: "misty", name: "Misty", details: "Samoyed • 1 Year", image: "/marketplace-snow.jpg" },
];

export default function SelectPetPage() {
  const [selectedPets, setSelectedPets] = useState<string[]>(["charlie"]);
  const togglePet = (id: string) => setSelectedPets((current) => current.includes(id) ? current.filter((pet) => pet !== id) : [...current, id]);

  return (
    <div className="mx-auto mt-2.5 grid max-w-[747px] grid-cols-1 gap-[15px] px-[14px] pb-6 sm:px-[18px] md:grid-cols-[minmax(420px,1fr)_170px]">
      <section className="min-w-0">
        <h1 className="m-0 text-[19px] font-bold tracking-[-.8px] md:text-[21px]">Select your companions</h1>
        <p className="mb-[18px] mt-1.5 max-w-[315px] text-[9px] leading-[1.45] text-[#7c7071]">Who will our sitters be looking after? You can select multiple pets for this booking.</p>
        <div className="grid grid-cols-2 gap-[13px] sm:grid-cols-3">
          {pets.map((pet) => {
            const isSelected = selectedPets.includes(pet.id);
            return <button key={pet.id} type="button" onClick={() => togglePet(pet.id)} aria-pressed={isSelected} className={`relative min-h-[139px] rounded-[13px] border bg-white p-3 text-center transition hover:border-[#A13D3F] ${isSelected ? "border-[#A13D3F] shadow-[inset_0_0_0_1px_#A13D3F]" : "border-[#f0dfdd]"}`}>
              <img className="mx-auto h-[49px] w-[49px] rounded-full border-[3px] border-[#f7e8e5] object-cover" src={pet.image} alt={pet.name} />
              <span className={`absolute right-2.5 top-2.5 grid h-[15px] w-[15px] place-items-center rounded-full border text-[9px] text-white ${isSelected ? "border-[#A13D3F] bg-[#A13D3F]" : "border-[#DCC0BF]"}`}>{isSelected && "✓"}</span>
              <strong className="mt-2.5 block text-[10px]">{pet.name}</strong><span className="mt-1 block text-[8px] text-[#655a5b]">{pet.details}</span>
              <em className={`mt-2.5 inline-block rounded-full px-2 py-1 text-[6px] font-bold not-italic ${isSelected ? "bg-[#f8d8d1] text-[#A13D3F]" : "bg-[#f7e5e2] text-[#896566]"}`}>{isSelected ? "SELECTED" : "SELECT"}</em>
            </button>;
          })}
          <button type="button" className="min-h-[139px] rounded-[13px] border border-dashed border-[#e7b4ad] bg-white p-3 text-center"><span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-[#fae6e3] text-[18px] text-[#A13D3F]">+</span><strong className="mt-3 block text-[9px]">Add another pet</strong><span className="mt-1 block text-[7px] text-[#8d8182]">Register a new companion</span></button>
        </div>
        <div className="mt-6 border-t border-[#efdcda] pt-4"><div className="flex items-center justify-between px-[12px]"><Link href="/owner/bookings" className="text-[9px] text-[#A13D3F]">Cancel</Link><div className="flex gap-3"><Link href="/owner/bookings/new" className="rounded-[8px] border border-[#DCC0BF] px-3 py-[8px] text-[9px] text-[#A13D3F]">← Previous</Link><Link href="/owner/bookings/new/dates" className="rounded-[8px] bg-[#A13D3F] px-4 py-[9px] text-[9px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]">Next →</Link></div></div></div>
      </section>
      <BookingSummary service="Boarding" price="8,500.00" unit="/ night" />
    </div>
  );
}
