"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type ApiPet, getApiMessage } from "../../lib/pet-api";
import { CalendarIcon, ClockIcon, FilterIcon, MailIcon, SearchIcon } from "./dashboard-icons";
import Link from "next/link";
import PetCard from "../pet-card";

const statIcons = { calendar: CalendarIcon, mail: MailIcon, clock: ClockIcon };

type DashboardBooking = {
  id: string;
  sitter: string;
  pet: string;
  service: string;
  date: string;
  status: string;
  amount: string;
};

type DashboardOverviewProps = {
  userName: string;
  activeBookings: number;
  unreadMessages: number;
  nextAppointment: string;
  recentBookings: DashboardBooking[];
};

const statClasses = {
  rose: "bg-[#fff0ef] text-[#da7777]",
  mint: "bg-[#e9f7f2] text-[#3baf91]",
  coral: "bg-[#fda4a4] text-[#b4343b]",
};

export function DashboardOverview({
  userName,
  activeBookings,
  unreadMessages,
  nextAppointment,
  recentBookings,
}: DashboardOverviewProps) {
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
  const dashboardStats = [
    { label: "Active bookings", value: String(activeBookings), icon: "calendar" as const, tone: "rose" as const },
    { label: "Unread messages", value: String(unreadMessages), icon: "mail" as const, tone: "mint" as const },
    { label: "Next appointment", value: nextAppointment, icon: "clock" as const, tone: "coral" as const },
  ];

  return (
    <div className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="page-title text-[#30272a]">Welcome back, {userName}!</h1>
          <p className="page-subtitle mt-1 text-[#887c7d]">Everything looks great with your companions today.</p>
        </div>
        <Link href="/owner/bookings/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#ab3d42] px-5 text-[14px] font-semibold !text-white shadow-[0_7px_15px_rgba(171,61,66,0.15)] transition hover:bg-[#963438] [&_svg]:!text-white">
          <SearchIcon className="size-3.5 !text-white" /> Find a Sitter
        </Link>
      </section>

      <section aria-label="Dashboard summary" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => {
          const Icon = statIcons[stat.icon];
          return <article key={stat.label} className={`flex min-h-21 items-center gap-3 rounded-lg border border-[#f0dddd] px-4 ${stat.tone === "coral" ? "bg-[#ff9292]" : "bg-[#fff6f5]"}`}>
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${statClasses[stat.tone]}`}><Icon className="size-4" /></span>
            <div>
              <p className="text-[14px] font-medium uppercase tracking-[0.12em] text-[#8d7475]">{stat.label}</p>
              <p className="mt-0.5 text-[15px] font-bold text-[#392f31]">{stat.value}</p>
            </div>
          </article>;
        })}
      </section>

      <section id="my-pets" className="mt-7 scroll-mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title text-[#3b3133]">My Pet Family ({visiblePets.length})</h2>
          <Link href="/owner/pets" className="text-[14px] font-semibold text-[#ab3d42] hover:underline">View all &rarr;</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoadingPets && <p className="text-sm text-[#887c7d]">Loading your pets...</p>}
          {!isLoadingPets && petsError && <p className="text-sm text-[#b34b4b]">{petsError}</p>}

          {!isLoadingPets && !petsError && previewPets.map((pet) => (
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

          {!isLoadingPets && !petsError ? (
            <Link
              href="/owner/pets/add"
              className="group block h-full"
              aria-label="Add another pet"
            >
              <article className="flex h-full min-h-[392px] flex-col overflow-hidden rounded-[20px] border-2 border-dashed border-[#e6c7c7] bg-[#fffaf9] p-4 shadow-[0_10px_30px_rgba(91,52,51,0.06)] transition hover:border-[#d99a9d] hover:bg-[#fff6f5]">
                <div className="relative mb-4 h-[220px] w-full overflow-hidden rounded-[18px] bg-[#fffaf9]">
                  <div className="absolute inset-0 rounded-[18px] border border-dashed border-[#e8c7c7]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-[2px] border-[#d69a9e] text-[42px] font-light leading-none text-[#ab3d42]">
                      +
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex-1 px-1 text-center">
                  <h3 className="text-[18px] font-bold text-[#403537]">Add another pet</h3>
                  <p className="mt-2 text-[14px] leading-5 text-[#7f7072]">
                    Grow your pet family in just a few steps.
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-3 px-1 opacity-0">
                  <span className="flex w-1/2 items-center justify-center rounded-lg bg-[#fff2f2] px-3 py-2 text-[13px] font-semibold text-[#ab3d42]">
                    Edit
                  </span>
                  <span className="flex w-1/2 items-center justify-center rounded-lg bg-[#ffecec] px-3 py-2 text-[13px] font-semibold text-[#b34b4b]">
                    Delete
                  </span>
                </div>
              </article>
            </Link>
          ) : null}
        </div>
      </section>

      <section id="bookings" className="mt-8 scroll-mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title text-[#3b3133]">Recent Bookings</h2>
          <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded border border-[#eadedc] bg-white px-3 text-[14px] font-medium text-[#76696a] hover:border-[#d9bbb9]">
            <FilterIcon className="size-3" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#efdddd] bg-white">
          <table className="w-full min-w-175 border-collapse text-left">
            <thead className="bg-[#fff5f4] text-[14px] uppercase tracking-[0.12em] text-[#705e60]">
              <tr>
                <th className="px-4 py-3 font-semibold">Sitter</th><th className="px-3 py-3 font-semibold">Pet</th><th className="px-3 py-3 font-semibold">Service</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3e9e7]">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="text-[14px] text-[#5b4e50]">
                  <td className="px-4 py-3"><span className="font-medium text-[#433739]">{booking.sitter}</span></td>
                  <td className="px-3 py-3">{booking.pet}</td><td className="px-3 py-3 text-[#b7565a]">{booking.service}</td><td className="px-3 py-3">{booking.date}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[7px] font-bold uppercase tracking-wide ${booking.status === "Confirmed" ? "bg-[#ddf5ec] text-[#329879]" : "bg-[#f6e8e7] text-[#a27676]"}`}>{booking.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-[#403436]">{booking.amount}</td>
                </tr>
              ))}
              {recentBookings.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#887c7d]">No bookings yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Link href="/owner/bookings" className="mt-3 block text-right text-[14px] font-semibold text-[#ab3d42] hover:underline">View all &rarr;</Link>
      </section>
    </div>
  );
}
