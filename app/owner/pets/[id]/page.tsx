"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import Link from "next/link";
import { type ApiPet, getApiMessage } from "../../../../lib/pet-api";
import { parsePetNotes } from "../../../../lib/pet-notes";

const pageColors = {
  pageBg: "bg-[#fff8f7]",
  shellBorder: "border-[#f3dfdf]",
  cardBorder: "border-[#f0e3e3]",
  cardBg: "bg-white",
  heading: "text-[#3f3436]",
  subtext: "text-[#7f7072]",
  muted: "text-[#8b7d7e]",
  rose: "text-[#bf494f]",
  roseBg: "bg-[#fff2f2]",
  careBg: "bg-[#fffdfd]",
};

type Params = { params: Promise<{ id: string }> };

export default function PetProfilePage({ params }: Params) {
  const [pet, setPet] = useState<ApiPet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [petId, setPetId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPet() {
      const { id } = await params;
      if (!isActive) return;

      setPetId(id);
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/pets/${encodeURIComponent(id)}`);

        if (!response.ok) {
          if (response.status === 404) throw new Error("Pet not found.");
          if (response.status === 403) throw new Error("You do not have permission to view this pet.");
          throw new Error(await getApiMessage(response));
        }

        const result: ApiPet = await response.json();
        if (isActive) setPet(result);
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : "Could not load pet. Please try again.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadPet();
    return () => {
      isActive = false;
    };
  }, [params]);

  if (isLoading || error || !pet) {
    return (
      <div className="min-h-screen flex bg-[#fff8f7]">
        <OwnerSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <div className="m-8">{isLoading ? "Loading pet..." : error || "Pet not found."}</div>
        </div>
      </div>
    );
  }

  const details = [
    pet.age !== null ? `${pet.age} years old` : null,
    pet.breed,
    pet.species,
    pet.gender,
  ].filter(Boolean).join(" • ");
  const notes = parsePetNotes(pet.medical_notes);

  return (
    <div className={`min-h-screen flex ${pageColors.pageBg}`}>
      <OwnerSidebar />
      <div className="flex-1">
        <DashboardHeader />

        <main className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className={`page-title ${pageColors.heading}`}>Pet Profile</h1>
              <p className={`page-subtitle mt-1 ${pageColors.muted}`}>Everything you need to know about your furry companion, all in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/owner/pets" className={`rounded-md border ${pageColors.cardBorder} bg-white px-4 py-2 text-[#6f5f5f]`}>Back to pets</Link>
              <Link href={`/owner/pets/${petId}/edit`} className="rounded-md bg-[#b8454a] px-4 py-2 text-white shadow-sm">Edit Profile</Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className={`rounded-[20px] border ${pageColors.shellBorder} ${pageColors.cardBg} p-6 shadow-[0_1px_0_rgba(255,255,255,0.9)]`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-6">
                  <div className="h-28 w-28 overflow-hidden rounded-xl bg-[#f7f0ef] shadow-[0_8px_20px_rgba(176,114,114,0.14)]">
                    {pet.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pet.photo} alt={pet.pet_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#8c7b7b]">No image</div>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-[28px] font-bold leading-none ${pageColors.heading}`}>{pet.pet_name}</h2>
                    <p className={`mt-3 text-[17px] ${pageColors.subtext}`}>{details || "Pet"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={`rounded-2xl border ${pageColors.cardBorder} bg-white p-5`}>
                <h4 className="text-[11px] font-semibold tracking-[0.08em] text-[#8a7b7c]">WEIGHT</h4>
                <div className="mt-2 text-[26px] font-bold text-[#3f3436]">{pet.weight_kg ? `${pet.weight_kg} kg` : "Not provided"}</div>
              </div>
              <div className={`rounded-2xl border ${pageColors.cardBorder} bg-white p-5`}>
                <h4 className="text-[11px] font-semibold tracking-[0.08em] text-[#8a7b7c]">AGE</h4>
                <div className="mt-2 text-[26px] font-bold text-[#3f3436]">{pet.age !== null ? `${pet.age} years` : "Not provided"}</div>
              </div>
            </div>

            <div className={`rounded-2xl border ${pageColors.cardBorder} ${pageColors.cardBg} p-6`}>
              <h3 className={`flex items-center gap-2 text-[15px] font-semibold ${pageColors.heading}`}>
                <span className="text-[#c64f55]">ⓘ</span>
                About {pet.pet_name}
              </h3>
              <div className={`mt-4 rounded-2xl border ${pageColors.cardBorder} ${pageColors.careBg} p-5`}>
                <p className={`text-[15px] leading-7 ${pageColors.subtext}`}>{notes.about || "No details have been added for this pet."}</p>
              </div>
            </div>

            <div className={`rounded-2xl border ${pageColors.cardBorder} ${pageColors.cardBg} p-6`}>
              <h3 className={`flex items-center gap-2 text-[15px] font-semibold ${pageColors.heading}`}>
                <span className="text-[#c64f55]">◌</span>
                Care Instructions
              </h3>
              <div className={`mt-4 rounded-2xl border ${pageColors.cardBorder} ${pageColors.careBg} p-5`}>
                <p className={`text-[15px] leading-7 ${pageColors.subtext}`}>{notes.careInstructions || "No care instructions have been added for this pet."}</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
