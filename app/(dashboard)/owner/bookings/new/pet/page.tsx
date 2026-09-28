"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookingSummary from "../components/booking-summary";
import { type ApiPet, getApiMessage } from "../../../../../../lib/pet-api";
import { readBookingDraft, updateBookingDraft } from "../../../../../../lib/booking-draft";

export default function SelectPetPage() {
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedPet(readBookingDraft().petId || "");
    fetch("/api/pets")
      .then(async (response) => {
        if (!response.ok) throw new Error(await getApiMessage(response));
        return response.json();
      })
      .then((data: ApiPet[]) => setPets(data))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load your pets."));
  }, []);

  return (
    <div className="mx-auto mt-2.5 grid max-w-[747px] grid-cols-1 gap-[15px] px-[14px] pb-6 sm:px-[18px] md:grid-cols-[minmax(420px,1fr)_170px]">
      <section className="min-w-0">
        <h1 className="text-[21px] font-bold">Select your companion</h1>
        <p className="mb-5 mt-1 text-sm text-[#7c7071]">Choose the pet this booking is for.</p>
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pets.map((pet) => {
            const selected = selectedPet === pet.pet_id;
            return (
              <button key={pet.pet_id} type="button" onClick={() => setSelectedPet(pet.pet_id)} className={`rounded-xl border bg-white p-3 text-center ${selected ? "border-[#A13D3F] ring-1 ring-[#A13D3F]" : "border-[#f0dfdd]"}`}>
                {pet.photo ? <img className="mx-auto h-14 w-14 rounded-full object-cover" src={pet.photo} alt={pet.pet_name} /> : <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff0ef] text-xl">🐾</span>}
                <strong className="mt-2 block text-sm">{pet.pet_name}</strong>
                <span className="text-xs text-[#655a5b]">{pet.breed || pet.species || "Pet"}</span>
              </button>
            );
          })}
          <Link href="/owner/pets/add" className="grid min-h-36 place-items-center rounded-xl border border-dashed border-[#e7b4ad] bg-white p-3 text-center text-sm text-[#A13D3F]">+ Add another pet</Link>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[#efdcda] pt-4">
          <Link href="/owner/bookings" className="text-sm text-[#A13D3F]">Cancel</Link>
          <div className="flex gap-3">
            <Link href="/owner/bookings/new" className="rounded-lg border border-[#DCC0BF] px-3 py-2 text-sm text-[#A13D3F]">← Previous</Link>
            {selectedPet ? <Link href="/owner/bookings/new/dates" onClick={() => updateBookingDraft({ petId: selectedPet })} className="rounded-lg bg-[#A13D3F] px-4 py-2 text-sm font-bold text-white">Next →</Link> : <span className="rounded-lg bg-[#e8c9c6] px-4 py-2 text-sm text-white">Select a pet</span>}
          </div>
        </div>
      </section>
      <BookingSummary service="Pet care" price="Pending" unit="" />
    </div>
  );
}
