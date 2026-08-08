"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardStats, pets, recentBookings } from "../../lib/owner-dashboard-data";
import { CalendarIcon, ClockIcon, FilterIcon, MailIcon, SearchIcon } from "./dashboard-icons";
import Link from "next/link";
import PetCard from "../pet-card";

const statIcons = { calendar: CalendarIcon, mail: MailIcon, clock: ClockIcon };

const statClasses = {
  rose: "bg-[#fff0ef] text-[#da7777]",
  mint: "bg-[#e9f7f2] text-[#3baf91]",
  coral: "bg-[#fda4a4] text-[#b4343b]",
};

const dashboardPets = [
  ...pets,
  {
    id: 4,
    name: "Shenu",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=700&q=85",
    details: "Samoyed â€¢ 4 Years Old",
  },
];

function getPetCardDetails(details: string) {
  const [breed = "Unknown"] = details.split(" \u00e2\u20ac\u00a2 ");
  const catKeywords = ["siamese", "shorthair", "persian", "maine", "ragdoll", "sphynx", "tabby", "balinese", "burmese", "oriental", "cat", "domestic"];
  const type = catKeywords.some((keyword) => breed.toLowerCase().includes(keyword)) ? "Cat" : "Dog";

  return { breed, type };
}

export function DashboardOverview() {
  const router = useRouter();
  const [visiblePets, setVisiblePets] = useState(dashboardPets);

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
          <h2 className="section-title text-[#3b3133]">My Pet Family</h2>
          <Link href="/owner/pets" className="text-[10px] font-semibold text-[#ab3d42] hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visiblePets.map((pet) => {
            const { breed, type } = getPetCardDetails(pet.details);

            return (
              <PetCard
                key={pet.id}
                image={pet.image}
                name={pet.name}
                type={type}
                breed={breed}
                href={`/owner/pets/${pet.id}`}
                onCardClick={() => router.push(`/owner/pets/${pet.id}`)}
                onEdit={() => router.push(`/owner/pets/${pet.id}/edit`)}
                onDelete={() => setVisiblePets((currentPets) => currentPets.filter((currentPet) => currentPet.id !== pet.id))}
              />
            );
          })}
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
        <a href="#view-bookings" className="mt-3 block text-right text-[10px] font-semibold text-[#ab3d42] hover:underline">View all →</a>
      </section>
    </div>
  );
}
