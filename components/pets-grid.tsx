"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PetCard from "./pet-card";

type PetItem = {
  id: number;
  name: string;
  image?: string;
  type?: string;
  breed?: string;
  age?: string | number;
};

export default function PetsGrid({ pets }: { pets: PetItem[] }) {
  const router = useRouter();
  const [visiblePets, setVisiblePets] = useState(pets);
  const [deleteTarget, setDeleteTarget] = useState<PetItem | null>(null);

  useEffect(() => {
    setVisiblePets(pets);
  }, [pets]);

  const handleEdit = (petId: number) => {
    const pet = visiblePets.find((item) => item.id === petId);
    if (pet) {
      router.push(`/owner/pets/${pet.id}/edit`);
    }
  };

  const openDeleteDialog = (petId: number) => {
    const pet = visiblePets.find((item) => item.id === petId) || null;
    setDeleteTarget(pet);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setVisiblePets((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visiblePets.map((p) => (
          <PetCard
            key={p.id}
            image={p.image}
            name={p.name}
            type={p.type}
            breed={p.breed}
            age={p.age}
            href={`/owner/pets/${p.id}`}
            onEdit={() => handleEdit(p.id)}
            onDelete={() => openDeleteDialog(p.id)}
          />
        ))}

        <Link href="/owner/pets/add" className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#e8cfcf] bg-white p-6 text-center text-[#8c7b7b] transition hover:border-[#d9b1b1] hover:bg-[#fffafa]">
          <div>
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[#f0deda] text-[#ab3d42]">
              +
            </span>
            <p className="text-sm font-semibold">Add another pet</p>
            <p className="mt-1 text-xs text-[#9b8b8b]">Grow your pet family in just a few steps.</p>
          </div>
        </Link>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[#f0e3e3] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <h3 className="text-[18px] font-semibold text-[#30272a]">Delete pet?</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#6f5f5f]">
              Are you sure you want to delete <span className="font-semibold text-[#b54a50]">{deleteTarget.name}</span>? This action will remove the pet from your list for now.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#eedddd] bg-white px-4 text-[13px] font-medium text-[#7a6768] hover:bg-[#fff8f8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#b54a50] px-4 text-[13px] font-medium text-white hover:bg-[#a94046]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
