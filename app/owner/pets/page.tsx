import React from "react";
import PetsGrid from "../../../components/pets-grid";
import { pets as samplePets } from "../../../lib/owner-dashboard-data";
import { DashboardHeader } from "../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../components/owner-dashboard/owner-sidebar";

function determinePetType(breed?: string, name?: string) {
  const b = (breed || "").toLowerCase();
  const catKeywords = ["siamese", "shorthair", "persian", "maine", "ragdoll", "sphynx", "tabby", "balinese", "burmese", "oriental", "cat", "domestic"];
  const dogKeywords = ["retriever", "bulldog", "terrier", "poodle", "beagle", "labrador", "golden", "shepherd", "husky", "samoyed", "spaniel", "dog"];

  if (catKeywords.some((k) => b.includes(k))) return "Cat";
  if (dogKeywords.some((k) => b.includes(k))) return "Dog";
  // fallback: try name hints
  const n = (name || "").toLowerCase();
  if (n.includes("cat") || n.includes("kitty") || n.includes("kitten")) return "Cat";
  if (n.includes("dog") || n.includes("puppy")) return "Dog";
  return "Pet";
}

function parseDetails(details?: string, name?: string) {
  if (!details) return { type: "Pet", breed: "Unknown", age: "" };
  const parts = details.split(" • ");
  const breed = parts[0] || "Unknown";
  const age = (parts[1] || "").replace(" Years Old", "").replace(" Year Old", "").replace(" yrs", "");
  const type = determinePetType(breed, name);
  return { type, breed, age };
}

export default function PetFamilyPage() {
  const handleEdit = (name: string) => {
    // placeholder - no backend
    // eslint-disable-next-line no-alert
    alert(`Edit ${name}`);
  };

  const handleDelete = (name: string) => {
    // placeholder - no backend
    // eslint-disable-next-line no-alert
    alert(`Delete ${name}`);
  };

  const extraPets = [
    {
      id: 4,
      name: "Shenu",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=700&q=85",
      type: "Dog",
      breed: "Samoyed",
      age: "4",
    },
    {
      id: 5,
      name: "Brownie",
      image:
        "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=700&q=85",
      type: "Dog",
      breed: "French Bulldog",
      age: "2",
    },
    {
      id: 6,
      name: "Sheba",
      image:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=700&q=85",
      type: "Cat",
      breed: "Siamese",
      age: "3",
    },
  ];

  const pets = [
    ...samplePets.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      ...parseDetails(p.details, p.name),
    })),
    ...extraPets,
  ];

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
            <PetsGrid pets={pets} />
          </main>
        </div>
      </div>
    </div>
  );
}
