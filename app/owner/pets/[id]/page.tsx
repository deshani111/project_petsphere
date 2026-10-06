"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import { type ApiPet, getApiMessage } from "../../../../lib/pet-api";
import { parsePetNotes } from "../../../../lib/pet-notes";

type Params = {
  params: Promise<{ id: string }>;
};

function OwnerShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#faf5f5]">
      <OwnerSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="w-full px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

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
          if (response.status === 403) {
            throw new Error("You do not have permission to view this pet.");
          }
          throw new Error(await getApiMessage(response));
        }

        const result: ApiPet = await response.json();
        if (isActive) setPet(result);
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Could not load pet.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadPet();

    return () => {
      isActive = false;
    };
  }, [params]);

  if (isLoading) {
    return <OwnerShell>Loading pet...</OwnerShell>;
  }

  if (error) {
    return <OwnerShell>{error}</OwnerShell>;
  }

  if (!pet) {
    return <OwnerShell>Pet not found.</OwnerShell>;
  }

  const petGender = pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1).toLowerCase() : null;
  const details = [pet.age !== null ? `${pet.age} years` : null, pet.breed, petGender].filter(Boolean).join(" | ");
  const notes = parsePetNotes(pet.medical_notes);
  const sterilizationStatus =
    notes.sterilized === "yes"
      ? "Yes — Neutered/Spayed"
      : notes.sterilized === "no"
        ? "No — Not sterilized"
        : notes.sterilized
          ? "Unknown"
          : "Not provided";

  // Replace these with real owner values from the API later
  const ownerAddress = "Address not available";
  const memberSince = new Date(pet.created_date).getFullYear();
  const lastUpdated = new Date(pet.created_date).toLocaleDateString();

  return (
    <OwnerShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#3f3436]">Pet Profile</h1>
            <p className="mt-1 text-[#8b7d7e]">Everything you need to know about your furry companion.</p>
          </div>

          <Link
            href={`/owner/pets/${petId}/edit`}
            className="inline-flex items-center justify-center rounded-xl bg-[#b8454a] px-5 py-3 text-sm font-medium !text-white hover:bg-[#a13d43] hover:!text-white"
          >
            Edit Profile
          </Link>
        </div>

        <section className="min-h-[180px] rounded-[28px] border border-[#f1d6d6] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-[#f1d6d6] bg-[#f7f0ef]">
              {pet.photo ? (
                <img src={pet.photo} alt={pet.pet_name} className="h-full w-full rounded-full object-cover object-center" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#8c7b7b]">No image</div>
              )}
            </div>

            <div className="flex-1 pl-1 sm:pl-2">
              <h2 className="text-[36px] font-bold leading-tight text-[#3f3436]">{pet.pet_name}</h2>
              <p className="mt-2 text-[16px] text-[#7f7072]">{details || "Pet"}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f1d6d6] bg-[#fff1f1] px-4 py-2 text-[14px] text-[#8b5b5d]">
                  Location: {ownerAddress}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-[#d8eadf] bg-[#eef8f1] px-4 py-2 text-[14px] text-[#4d7a5f]">
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[#f1d6d6] bg-white p-4">
            <div className="pl-2 sm:pl-3">
              <p className="text-[14px] font-medium text-[#b8454a]">Weight</p>
            </div>
            <p className="mt-2 pl-2 text-[30px] font-bold leading-tight text-[#3f3436] sm:pl-3">{pet.weight_kg ? `${pet.weight_kg} kg` : "Not provided"}</p>
          </div>

          <div className="rounded-3xl border border-[#d8eadf] bg-white p-4">
            <div className="pl-2 sm:pl-3">
              <p className="text-[14px] font-medium text-[#2f7a57]">Vaccination Status</p>
            </div>
            <p className="mt-2 pl-2 text-[30px] font-bold leading-tight text-[#2f7a57] sm:pl-3">{pet.medical_report ? "Vaccinated" : "Not uploaded"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#f1d6d6] bg-white p-6">
              <h3 className="text-[20px] font-semibold text-[#3f3436]">About {pet.pet_name}</h3>

              <div className="mt-4 rounded-2xl border border-[#f1d6d6] bg-[#fff6f6] p-5">
                <p className="text-[16px] leading-7 text-[#5f5052]">{notes.about || "No details have been added for this pet."}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f3dede] px-3 py-1 text-xs text-[#8b5b5d]">Friendly</span>
                  <span className="rounded-full bg-[#f3dede] px-3 py-1 text-xs text-[#8b5b5d]">Loyal</span>
                  <span className="rounded-full bg-[#f3dede] px-3 py-1 text-xs text-[#8b5b5d]">Active</span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#f1d6d6] bg-white p-6">
              <h3 className="text-[20px] font-semibold text-[#3f3436]">Care Instructions</h3>

              <div className="mt-4 rounded-2xl border border-[#f1d6d6] bg-[#fff6f6] p-5">
                <p className="text-[16px] leading-7 text-[#5f5052]">{notes.careInstructions || "No care instructions have been added for this pet."}</p>
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-[#f1d6d6] bg-white p-5">
            <h3 className="text-[20px] font-semibold text-[#3f3436]">Medical Records</h3>

            <div className="mt-4 space-y-3 rounded-2xl border border-[#f1d6d6] bg-[#fff6f6] p-4">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8d6b6d]">Sterilization Status</p>
                <p className="mt-1 text-[16px] font-semibold text-[#3f3436]">{sterilizationStatus}</p>
              </div>

              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8d6b6d]">Last Dental / Vaccination</p>
                <p className="mt-1 text-[16px] font-semibold text-[#3f3436]">{notes.lastDentalVaccination || "Not provided"}</p>
              </div>
            </div>

            {pet.medical_report ? (
              <div className="mt-4 rounded-2xl border border-[#f1d6d6] bg-[#fff6f6] p-3">
                <img src={pet.medical_report} alt="Medical record" className="h-36 w-full rounded-xl border border-[#e8c7c7] object-cover" />

                <div className="mt-2">
                  <p className="text-[14px] font-semibold text-[#3f3436]">Official Pet Vaccination Record</p>
                  <p className="text-[12px] text-[#7f7072]">Last updated: {lastUpdated}</p>
                </div>

                <a
                  href={pet.medical_report}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#d98b8f] bg-[#fff2f2] px-4 py-2 text-[14px] font-medium text-[#b8454a] hover:bg-[#fde7e8]"
                >
                  View Full Document
                </a>

                {notes.medications ? (
                  <div className="mt-3 rounded-xl border border-[#f1d6d6] bg-[#fffdfd] p-3">
                    <h4 className="text-[14px] font-semibold text-[#3f3436]">Medications</h4>
                    <div className="mt-2 max-h-40 overflow-y-auto pr-1">
                      <p className="whitespace-pre-line text-[16px] leading-6 text-[#5f5052]">{notes.medications}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#e8c7c7] bg-[#fff8f7] p-6 text-center text-[16px] text-[#9f8e8f]">
                No medical record uploaded
              </div>
            )}
          </aside>
        </div>
      </div>
    </OwnerShell>
  );
}
