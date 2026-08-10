"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type ApiPet, getApiMessage } from "../../lib/pet-api";
import { CalendarIcon, ClockIcon, FilterIcon, MailIcon, SearchIcon } from "./dashboard-icons";
import Link from "next/link";
import PetCard from "../pet-card";

const statIcons = { calendar: CalendarIcon, mail: MailIcon, clock: ClockIcon };

const dashboardStats = [
  { label: "Active bookings", value: "04", icon: "calendar" as const, tone: "rose" as const },
  { label: "Messages", value: "12", icon: "mail" as const, tone: "mint" as const },
  { label: "Next appointment", value: "July 14, 10:00 AM", icon: "clock" as const, tone: "coral" as const },
];

const recentBookings = [
  { id: 1, sitter: "Shannon Perera", sitterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80", pet: "Cooper", service: "Dog Walking", date: "July 14, 2026", status: "Confirmed", amount: "Rs. 5,000.00" },
  { id: 2, sitter: "Mark Fernando", sitterImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80", pet: "Luna", service: "Pet Sitting", date: "May 22, 2026", status: "Completed", amount: "Rs. 8,000.00" },
  { id: 3, sitter: "Nivya Perera", sitterImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80", pet: "Misty", service: "Grooming", date: "May 20, 2026", status: "Completed", amount: "Rs. 6,000.00" },
];

const statClasses = {
  rose: "bg-[#fff0ef] text-[#da7777]",
  mint: "bg-[#e9f7f2] text-[#3baf91]",
  coral: "bg-[#fda4a4] text-[#b4343b]",
};

export function DashboardOverview() {
  const router = useRouter();
  const [visiblePets, setVisiblePets] = useState<ApiPet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [petsError, setPetsError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPets() {
      try {
        setPetsError("");
        const response = await fetch("/api/pets");
        if (!response.ok) throw new Error(await getApiMessage(response));
        const pets: ApiPet[] = await response.json();
        if (isActive) setVisiblePets(pets);
      } catch (error) {
        console.error("Could not load dashboard pets:", error);
        if (isActive) {
          setPetsError(error instanceof Error ? error.message : "Could not load your pets.");
        }
      } finally {
        if (isActive) setIsLoadingPets(false);
      }
    }

    void loadPets();
    return () => {
      isActive = false;
    };
  }, []);

  const handleDelete = async (petId: string) => {
    try {
      const response = await fetch(`/api/pets/${encodeURIComponent(petId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getApiMessage(response));
      setVisiblePets((currentPets) => currentPets.filter((pet) => pet.pet_id !== petId));
    } catch (error) {
      console.error("Could not delete dashboard pet:", error);
    }
  };

  const previewPets = visiblePets.slice(0, 4);

  return (
    <div className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="page-title text-[#30272a]">Welcome back, John!</h1>
          <p className="page-subtitle mt-1 text-[#887c7d]">Everything looks great with your companions today.</p>
        </div>
        <a href="#find-a-sitter" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#ab3d42] px-5 text-[11px] font-semibold text-white shadow-[0_7px_15px_rgba(171,61,66,0.15)] transition hover:bg-[#963438]">
          <SearchIcon className="size-3.5" /> Find a Sitter
        </a>
      </section>

      <section aria-label="Dashboard summary" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => {
          const Icon = statIcons[stat.icon];
          return <article key={stat.label} className={`flex min-h-21 items-center gap-3 rounded-lg border border-[#f0dddd] px-4 ${stat.tone === "coral" ? "bg-[#ff9292]" : "bg-[#fff6f5]"}`}>
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${statClasses[stat.tone]}`}><Icon className="size-4" /></span>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#8d7475]">{stat.label}</p>
              <p className="mt-0.5 text-[13px] font-bold text-[#392f31]">{stat.value}</p>
            </div>
          </article>;
        })}
      </section>

      <section id="my-pets" className="mt-7 scroll-mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title text-[#3b3133]">My Pet Family ({visiblePets.length})</h2>
          <Link href="/owner/pets" className="text-[10px] font-semibold text-[#ab3d42] hover:underline">View all &rarr;</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoadingPets && <p className="text-sm text-[#887c7d]">Loading your pets...</p>}
          {!isLoadingPets && petsError && <p className="text-sm text-[#b34b4b]">{petsError}</p>}
          {!isLoadingPets && !petsError && visiblePets.length === 0 && (
            <p className="text-sm text-[#887c7d]">No pets added yet.</p>
          )}
          {previewPets.map((pet) => (
            <PetCard
              key={pet.pet_id}
              image={pet.photo || undefined}
              name={pet.pet_name}
              type={pet.species || "Pet"}
              breed={pet.breed || "Unknown"}
              href={`/owner/pets/${pet.pet_id}`}
              onCardClick={() => router.push(`/owner/pets/${pet.pet_id}`)}
              onEdit={() => router.push(`/owner/pets/${pet.pet_id}/edit`)}
              onDelete={() => void handleDelete(pet.pet_id)}
            />
          ))}
        </div>
      </section>

      <section id="bookings" className="mt-8 scroll-mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title text-[#3b3133]">Recent Bookings</h2>
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded border border-[#eadedc] bg-white px-3 text-[9px] font-medium text-[#76696a] hover:border-[#d9bbb9]">
            <FilterIcon className="size-3" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#efdddd] bg-white">
          <table className="w-full min-w-175 border-collapse text-left">
            <thead className="bg-[#fff5f4] text-[9px] uppercase tracking-[0.12em] text-[#705e60]">
              <tr>
                <th className="px-4 py-3 font-semibold">Sitter</th><th className="px-3 py-3 font-semibold">Pet</th><th className="px-3 py-3 font-semibold">Service</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3e9e7]">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="text-[10px] text-[#5b4e50]">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><img className="size-6 rounded-full object-cover" src={booking.sitterImage} alt="" /><span className="font-medium text-[#433739]">{booking.sitter}</span></div></td>
                  <td className="px-3 py-3">{booking.pet}</td><td className="px-3 py-3 text-[#b7565a]">{booking.service}</td><td className="px-3 py-3">{booking.date}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[7px] font-bold uppercase tracking-wide ${booking.status === "Confirmed" ? "bg-[#ddf5ec] text-[#329879]" : "bg-[#f6e8e7] text-[#a27676]"}`}>{booking.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-[#403436]">{booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a href="#view-bookings" className="mt-3 block text-right text-[10px] font-semibold text-[#ab3d42] hover:underline">View all &rarr;</a>
      </section>
    </div>
  );
}
