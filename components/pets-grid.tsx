"use client";

import { useState } from "react";
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

  const [deleteTarget, setDeleteTarget] = useState<PetItem | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (petId: string) => {
    const pet = pets.find((item) => item.id === petId);

    if (pet) {
      router.push(`/owner/pets/${pet.id}/edit`);
    }
  };

  const openDeleteDialog = (petId: string) => {
    const pet = pets.find((item) => item.id === petId) || null;

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
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Could not delete pet. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {pets.map((p) => (
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

        <Link
          href="/owner/pets/add"
          className="group block h-full min-h-[300px]"
          aria-label="Add another pet"
        >
          <article className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-xl border-2 border-dashed border-[var(--ps-color-border-strong)] bg-[var(--ps-color-surface-muted)] p-3 shadow-[var(--ps-shadow-sm)] transition hover:border-[var(--ps-color-primary)] hover:bg-[var(--ps-color-primary-soft)] sm:p-3.5">
            <div className="relative mb-3 flex min-h-[175px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-[var(--ps-color-surface)]/40">
              <div className="absolute inset-0 rounded-lg border border-dashed border-[var(--ps-color-border)]" />

              <div className="relative grid size-16 place-items-center rounded-full border-2 border-[var(--ps-color-border-strong)] text-[38px] font-light leading-none ps-text-primary transition group-hover:bg-[var(--ps-color-surface)]">
                +
              </div>
            </div>

            <div className="shrink-0 px-1 pb-1 text-center">
              <h3 className="text-sm font-bold ps-text-default">
                Add another pet
              </h3>

              <p className="mt-1 text-xs leading-relaxed ps-text-muted">
                Grow your pet family in just a few steps.
              </p>
            </div>
          </article>
        </Link>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="ps-panel w-full max-w-md p-6">
            <h3 className="text-lg font-semibold ps-text-default">
              Delete pet?
            </h3>

            <p className="mt-2 text-sm leading-6 ps-text-muted">
              Are you sure you want to delete{" "}
              <span className="font-semibold ps-text-danger">
                {deleteTarget.name}
              </span>
              ?
            </p>
            {deleteError ? (
              <p className="mt-2 text-xs ps-text-danger">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="ps-btn ps-btn--outline min-h-10 px-4 font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="ps-btn ps-btn--danger min-h-10 px-4 font-medium"
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
