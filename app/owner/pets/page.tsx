"use client";

import { useCallback, useEffect, useState } from "react";
import PetsGrid from "../../../components/pets-grid";
import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";
import { type ApiPet, getApiMessage } from "../../../lib/pet-api";

function toPetCardItem(pet: ApiPet) {
  return {
    id: pet.pet_id,
    name: pet.pet_name,
    image: pet.photo || undefined,
    type: pet.species || "Pet",
    breed: pet.breed || "Unknown",
    age: pet.age ?? undefined,
  };
}

export default function PetFamilyPage() {
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pets");

      if (!response.ok) {
        throw new Error(await getApiMessage(response));
      }

      setPets(await response.json());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load pets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const handleDelete = async (petId: string) => {
    const response = await fetch(`/api/pets/${encodeURIComponent(petId)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(await getApiMessage(response));
    }

    await loadPets();
  };

  return (
    <div className="min-h-screen flex bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />

        <div className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
          <header className="mb-6">
            <h1 className="page-title text-[#30272a]">My Pet Family</h1>
            <p className="page-subtitle mt-1 text-[#887c7d]">Meet the family members who fill your home with love.</p>
          </header>

          <main>
            {isLoading ? <p className="page-subtitle text-[#887c7d]">Loading pets...</p> : null}
            {error ? <p className="page-subtitle text-[#c24a50]">{error}</p> : null}
            {!isLoading && !error ? <PetsGrid pets={pets.map(toPetCardItem)} onDelete={handleDelete} /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
