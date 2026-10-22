"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookingSummary from "../components/booking-summary";
import { useBooking } from "../components/booking-context";
import {
  type ApiPet,
  getApiMessage,
} from "../../../../../../lib/pet-api";

export default function SelectPetPage() {
  const { draft, setDraft } = useBooking();

  const [pets, setPets] = useState<ApiPet[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedPet = draft.pet ?? "";

  useEffect(() => {
    let cancelled = false;

    async function loadPets() {
      try {
        const response = await fetch("/api/pets");

        if (!response.ok) {
          throw new Error(await getApiMessage(response));
        }

        const data: ApiPet[] = await response.json();

        if (!cancelled) {
          setPets(data);
          setError("");
        }
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load your pets."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPets();

    return () => {
      cancelled = true;
    };
  }, []);

  function togglePet(petId: string) {
    setDraft({
      pet: selectedPet === petId ? null : petId,
    });
  }

  return (
    <div className="booking-content-grid">
      <section className="min-w-0">
        <h1 className="text-[21px] font-bold">
          Select your companion
        </h1>

        <p className="mb-4 mt-1 text-[9px] text-[#7c7071]">
          Choose the pet this booking is for.
        </p>

        {error ? (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-[#7c7071]">
            Loading your pets...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pets.map((pet) => {
              const selected = selectedPet === String(pet.pet_id);

              return (
                <button
                  key={pet.pet_id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePet(String(pet.pet_id))}
                  className={`min-h-[150px] rounded-[11px] border bg-white p-3 text-center transition ${
                    selected
                      ? "border-[#A13D3F] ring-1 ring-[#A13D3F]"
                      : "border-[#f0dfdd] hover:border-[#DCC0BF]"
                  }`}
                >
                  {pet.photo ? (
                    <img
                      className="mx-auto h-14 w-14 rounded-full object-cover"
                      src={pet.photo}
                      alt={pet.pet_name}
                    />
                  ) : (
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff0ef] text-xl">
                      🐾
                    </span>
                  )}

                  <strong className="mt-2 block text-[12px]">
                    {pet.pet_name}
                  </strong>

                  <span className="text-[8px] text-[#655a5b]">
                    {pet.breed || pet.species || "Pet"}
                  </span>

                  {selected ? (
                    <span className="mt-1 block text-[8px] font-semibold text-[#A13D3F]">
                      ✓ Selected
                    </span>
                  ) : null}
                </button>
              );
            })}

            <Link
              href="/owner/pets/add"
              className="grid min-h-[150px] place-items-center rounded-[11px] border border-dashed border-[#e7b4ad] bg-white p-3 text-center text-[9px] text-[#A13D3F]"
            >
              + Add another pet
            </Link>
          </div>
        )}

        {!isLoading && pets.length === 0 && !error ? (
          <p className="mt-3 text-sm text-[#7c7071]">
            You haven&apos;t added any pets yet. Add a pet before continuing.
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-[#efdcda] pt-3">
          <Link
            href="/owner/bookings"
            className="text-sm text-[#A13D3F]"
          >
            Cancel
          </Link>

          <div className="flex gap-3">
            <Link
              href="/owner/bookings/new"
              className="rounded-lg border border-[#DCC0BF] px-3 py-2 text-sm text-[#A13D3F]"
            >
              ← Previous
            </Link>

            {selectedPet ? (
              <Link
                href="/owner/bookings/new/dates"
                className="rounded-lg bg-[#A13D3F] px-4 py-2 text-sm font-bold text-white"
              >
                Next →
              </Link>
            ) : (
              <span className="pointer-events-none rounded-lg bg-[#e8c9c6] px-4 py-2 text-sm text-white">
                Select a pet
              </span>
            )}
          </div>
        </div>
      </section>

      <BookingSummary
        service="Pet care"
        price="Pending"
        unit=""
      />
    </div>
  );
}