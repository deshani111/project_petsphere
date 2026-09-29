"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PetCard from "./pet-card";

type PetItem = {
  id: string;
  name: string;
  image?: string;
  type?: string;
  breed?: string;
  age?: string | number;
};

export default function PetsGrid({
  pets,
  onDelete,
}: {
  pets: PetItem[];
  onDelete: (petId: string) => Promise<void>;
}) {
  const router = useRouter();
  const [visiblePets, setVisiblePets] = useState(pets);
  const [deleteTarget, setDeleteTarget] = useState<PetItem | null>(null);

  useEffect(() => {
    setVisiblePets(pets);
  }, [pets]);

  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (petId: string) => {
    const pet = visiblePets.find((item) => item.id === petId);
    if (pet) {
      router.push(`/owner/pets/${pet.id}/edit`);
    }
  };

  const openDeleteDialog = (petId: string) => {
    const pet = visiblePets.find((item) => item.id === petId) || null;
    setDeleteError("");
    setDeleteTarget(pet);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete pet. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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

       <Link href="/owner/pets/add" className="group block h-full" aria-label="Add another pet">
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
  </article>
</Link>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[#f0e3e3] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <h3 className="text-[18px] font-semibold text-[#30272a]">Delete pet?</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#6f5f5f]">
              Are you sure you want to delete <span className="font-semibold text-[#b54a50]">{deleteTarget.name}</span>?
            </p>
            {deleteError ? <p className="mt-2 text-[11px] text-[#c24a50]">{deleteError}</p> : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#eedddd] bg-white px-4 text-[13px] font-medium text-[#7a6768] hover:bg-[#fff8f8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#b54a50] px-4 text-[13px] font-medium text-white hover:bg-[#a94046]"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
