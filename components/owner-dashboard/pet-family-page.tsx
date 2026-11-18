
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Cat,
  Dog,
  Bird,
  PawPrint,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tags,
} from "lucide-react";

import PetsGrid from "../pets-grid";
import { SkeletonCard } from "../shared/skeleton";
import { type ApiPet, getApiMessage } from "../../lib/pet-api";

type PetCategory = "all" | "dogs" | "cats" | "birds" | "other";

const categoryMatches: Record<
  Exclude<PetCategory, "all" | "other">,
  RegExp
> = {
  dogs: /dog|canine/i,
  cats: /cat|feline/i,
  birds: /bird|avian/i,
};

function getCategory(
  pet: ApiPet
): Exclude<PetCategory, "all"> | null {
  const species = pet.species?.trim() ?? "";

  if (!species) return null;

  for (const category of ["dogs", "cats", "birds"] as const) {
    if (categoryMatches[category].test(species)) {
      return category;
    }
  }

  return "other";
}

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

function formatBookingDate(value: string | null) {
  if (!value) return "No upcoming bookings scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No upcoming bookings scheduled";
  }

  return `Next: ${new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)}`;
}

export function PetFamilyPage({
  upcomingBookingCount,
  nextBookingDate,
}: {
  upcomingBookingCount: number;
  nextBookingDate: string | null;
}) {
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<PetCategory>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");

  const loadPets = useCallback(async () => {
    try {
      const response = await fetch("/api/pets", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getApiMessage(response));
      }

      setPets(await response.json());
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load pets. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPets();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadPets]);

  const species = useMemo(
    () =>
      Array.from(
        new Set(
          pets
            .map((pet) => pet.species?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [pets]
  );

  const categoryCounts = useMemo(
    () => ({
      all: pets.length,
      dogs: pets.filter((pet) => getCategory(pet) === "dogs").length,
      cats: pets.filter((pet) => getCategory(pet) === "cats").length,
      birds: pets.filter((pet) => getCategory(pet) === "birds").length,
      other: pets.filter((pet) => getCategory(pet) === "other").length,
    }),
    [pets]
  );

  const visiblePets = useMemo(
    () =>
      pets
        .filter(
          (pet) =>
            category === "all" || getCategory(pet) === category
        )
        .filter((pet) =>
          `${pet.pet_name} ${pet.species ?? ""} ${pet.breed ?? ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        )
        .sort((a, b) =>
          sort === "name"
            ? a.pet_name.localeCompare(b.pet_name)
            : new Date(b.created_date).getTime() -
              new Date(a.created_date).getTime()
        ),
    [pets, category, search, sort]
  );

  const resetFilters = () => {
    setCategory("all");
    setSearch("");
  };

  const categoryOptions: Array<{
    key: PetCategory;
    label: string;
    count: number;
  }> = [
    { key: "all", label: "All", count: categoryCounts.all },
    { key: "dogs", label: "Dogs", count: categoryCounts.dogs },
    { key: "cats", label: "Cats", count: categoryCounts.cats },
    { key: "birds", label: "Birds", count: categoryCounts.birds },
    ...(categoryCounts.other > 0
      ? [
          {
            key: "other" as const,
            label: "Other",
            count: categoryCounts.other,
          },
        ]
      : []),
  ];

  const categoryIcon = (key: PetCategory) => {
    if (key === "dogs") return <Dog size={15} />;
    if (key === "cats") return <Cat size={15} />;
    if (key === "birds") return <Bird size={15} />;
    if (key === "other") return <Tags size={15} />;

    return <PawPrint size={15} />;
  };

  const handleDelete = async (petId: string) => {
    const response = await fetch(
      `/api/pets/${encodeURIComponent(petId)}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error(await getApiMessage(response));
    }

    await loadPets();
  };

  return (
    <main className="ps-page min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-370">

        {/* Page Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight ps-text-default sm:text-[28px]">
                My Pet Family
              </h1>

              {!isLoading && !error && (
                <span className="ps-badge border border-(--ps-color-border-strong) bg-(--ps-color-primary-soft) ps-text-primary">
                  {pets.length}{" "}
                  {pets.length === 1 ? "companion" : "companions"}{" "}
                  registered
                </span>
              )}
            </div>
          </div>

          <Link
            href="/owner/pets/add"
            className="ps-btn ps-btn--primary shrink-0 px-4"
          >
            <PawPrint size={14} />
            Add New Pet
          </Link>
        </header>

        {/* Summary Cards */}
        <section
          aria-label="Pet family summary"
          className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <article className="ps-card flex min-h-21.5 items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-(--ps-color-primary-soft) ps-text-primary">
              <PawPrint size={18} />
            </span>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
                Total Registered Pets
              </p>

              <p className="mt-1 text-lg font-bold leading-none text-slate-800">
                {isLoading || error ? "—" : pets.length}

                <span className="text-[10px] font-medium text-[#b33d43]">
                  {isLoading || error ? "" : " All accounted"}
                </span>
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                Active companions on PetSphere
              </p>
            </div>
          </article>

          <article className="ps-card flex min-h-21.5 items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-(--ps-color-primary-soft) ps-text-primary">
              <PawPrint size={18} />
            </span>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
                Species Represented
              </p>

              <p className="mt-1 text-lg font-bold leading-none text-slate-800">
                {isLoading || error
                  ? "—"
                  : `${species.length} ${
                      species.length === 1 ? "Type" : "Types"
                    }`}
              </p>

              <p className="mt-1 max-w-56 text-[9px] text-slate-400">
                {isLoading
                  ? "Loading species…"
                  : error
                    ? "Could not load species"
                    : species.length
                      ? species.join(", ")
                      : "No species recorded yet"}
              </p>
            </div>
          </article>

          <article className="ps-card flex min-h-21.5 items-center gap-3 p-4 sm:col-span-2 xl:col-span-1">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-(--ps-color-primary-soft) ps-text-primary">
              <CalendarDays size={18} />
            </span>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-slate-500">
                Upcoming Bookings
              </p>

              <p className="mt-1 text-lg font-bold leading-none text-slate-800">
                {upcomingBookingCount}

                <span className="text-[10px] font-medium text-slate-500">
                  {" "}Active
                </span>
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                {formatBookingDate(nextBookingDate)}
              </p>
            </div>
          </article>
        </section>

        {/* Search and Filters */}
        <section
          aria-label="Filter and search pets"
          className="ps-card mb-5 px-3 py-2.5 sm:px-4"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

            {/* Category Filters */}
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
              <span className="mr-1 shrink-0 text-[10px] font-medium text-slate-500">
                Filter:
              </span>

              {categoryOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setCategory(option.key)}
                  aria-pressed={category === option.key}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[10px] font-medium transition ${
                    category === option.key
                      ? "bg-(--ps-color-primary) text-white"
                      : "border border-(--ps-color-border) bg-(--ps-color-surface) ps-text-muted hover:border-(--ps-color-border-strong)"
                  }`}
                >
                  {categoryIcon(option.key)}
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            {/* Search and Sorting */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-(--ps-radius-sm) border border-(--ps-color-border) px-2.5 ps-text-muted focus-within:border-(--ps-color-primary) sm:w-56 sm:flex-none">
                <Search size={13} />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search pets by name..."
                  aria-label="Search pets by name"
                  className="min-w-0 flex-1 bg-transparent text-xs ps-text-default outline-none placeholder:ps-text-muted"
                />
              </label>

              <label className="flex h-11 items-center gap-2 rounded-(--ps-radius-sm) border border-(--ps-color-border) px-2.5 ps-text-muted">
                <SlidersHorizontal size={13} />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as "recent" | "name")
                  }
                  aria-label="Sort pets"
                  className="min-w-0 bg-transparent text-xs ps-text-default outline-none"
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}

            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError("");
                void loadPets();
              }}
              className="ml-3 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            role="status"
            aria-label="Loading pets"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <SkeletonCard image={false} key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && pets.length === 0 && (
          <div className="ps-card mb-4 p-4 text-sm ps-text-muted">
            Your pet family is ready to grow.{" "}

            <Link
              href="/owner/pets/add"
              className="font-semibold ps-text-primary underline underline-offset-2"
            >
              Add your first pet.
            </Link>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading &&
          !error &&
          visiblePets.length === 0 &&
          pets.length > 0 && (
            <div className="ps-card p-10 text-center">
              <Search
                className="mx-auto text-slate-400"
                size={24}
              />

              <h2 className="mt-3 text-sm font-semibold text-slate-700">
                No matching pets found.
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Try another name or species filter.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-xs font-semibold ps-text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Pet Grid */}
        {!isLoading &&
          !error &&
          (visiblePets.length > 0 || pets.length === 0) && (
            <PetsGrid
              pets={visiblePets.map(toPetCardItem)}
              onDelete={handleDelete}
            />
          )}

        {/* Find a Sitter Section */}
        <section className="ps-card mt-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="max-w-3xl text-[11px] leading-relaxed ps-text-muted sm:text-xs">
              Browse verified, highly-rated pet sitters, dog walkers, and
              boarding homes in your neighborhood tailored to your pets&apos;
              needs.
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                "Dog Walking",
                "Pet Sitting",
                "Overnight Boarding",
                "Grooming",
              ].map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-(--ps-color-border) bg-(--ps-color-surface-muted) px-2.5 py-1 text-[9px] font-medium ps-text-muted"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/owner/sitters"
            className="ps-btn ps-btn--primary shrink-0 justify-center px-4"
          >
            <Sparkles size={13} />
            Find a Sitter
          </Link>
        </section>
      </div>
    </main>
  );
}
