"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "../../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../../components/owner-dashboard/owner-sidebar";
import { combinePetNotes, parsePetNotes } from "../../../../../lib/pet-notes";

type RealPet = {
  pet_id: string;
  owner_id: string;
  pet_name: string;
  species: string | null;
  breed: string | null;
  gender: string | null;
  age: number | null;
  weight_kg: string | null;
  photo: string | null;
  medical_notes: string | null;
};

type EditPetForm = {
  pet_name: string;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight_kg: string;
  about: string;
  care_instructions: string;
};

type FormErrors = Partial<Record<keyof EditPetForm, string>>;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-[12px] font-semibold text-[#8b7072]">{children}</span>;
}

function FieldGroup({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error ? <p className="text-[11px] text-[#c24a50]">{error}</p> : null}
    </div>
  );
}

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const petId = id;

  const [pet, setPet] = useState<RealPet | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<EditPetForm>({
    pet_name: "",
    species: "",
    breed: "",
    gender: "",
    age: "",
    weight_kg: "",
    about: "",
    care_instructions: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPet() {
      setLoading(true);
      try {
        const response = await fetch(`/api/pets/${encodeURIComponent(petId)}`);
        const data = await response.json();

        if (!response.ok) {
          if (!cancelled) setLoadError(data.message || "Could not load this pet.");
          return;
        }

        if (!cancelled) setPet(data);
      } catch {
        if (!cancelled) setLoadError("Could not reach the server. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPet();
    return () => {
      cancelled = true;
    };
  }, [petId]);

  useEffect(() => {
    if (!pet) return;
    const notes = parsePetNotes(pet.medical_notes);
    setForm({
      pet_name: pet.pet_name ?? "",
      species: pet.species ?? "",
      breed: pet.breed ?? "",
      gender: pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : "",
      age: pet.age != null ? String(pet.age) : "",
      weight_kg: pet.weight_kg ?? "",
      about: notes.about,
      care_instructions: notes.careInstructions,
    });
    setPhotoPreview(pet.photo ?? "");
  }, [pet]);

  const validationMessages = useMemo(
    () => ({
      pet_name: "Pet name is required.",
      species: "Species is required.",
      breed: "Breed is required.",
      gender: "Gender is required.",
      age: "Age is required.",
      weight_kg: "Weight is required.",
    }),
    [],
  );

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const setValue = (key: keyof EditPetForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveMessage("");
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    (Object.keys(validationMessages) as Array<keyof typeof validationMessages>).forEach((key) => {
      if (!String(form[key]).trim()) {
        nextErrors[key] = validationMessages[key];
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch(`/api/pets/${encodeURIComponent(petId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_name: form.pet_name,
          species: form.species,
          breed: form.breed,
          gender: form.gender.toLowerCase(),
          age: form.age ? Number(form.age) : undefined,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
          medical_notes: combinePetNotes(form.about, form.care_instructions),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveMessage(data.message || "Could not save changes.");
        return;
      }

      setSaveMessage("Changes saved successfully.");
      router.push(`/owner/pets/${petId}`);
    } catch {
      setSaveMessage("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextPreview = URL.createObjectURL(file);
    setPhotoPreview(nextPreview);
    setSaveMessage("");
  };

  const inputClass =
    "h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]";

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#fff8f7]">
        <OwnerSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <div className="p-6">Loading pet...</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex bg-[#fff8f7]">
        <OwnerSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <div className="p-6">{loadError}</div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex bg-[#fff8f7]">
        <OwnerSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <div className="p-6">Pet not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />

        <main className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#4f4143]">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-[18px] font-semibold leading-none hover:text-[#ab3d42]"
                  aria-label="Back to pet profile"
                >
                  <span aria-hidden>‹</span>
                </button>
                <h1 className="page-title">Edit Pet Profile</h1>
              </div>
              <p className="page-subtitle mt-1 text-[#9f8e8f]">
                Keep your pet&apos;s information up to date to ensure safe, personalized, and loving care.
              </p>
            </div>
          </div>

          <section className="w-full rounded-[18px] border border-[#f3dede] bg-white px-5 py-6 shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:px-6">
            <div className="mb-6 rounded-[18px] border border-[#f2e2e2] bg-[#fffafa] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-[#f1dede] bg-[#f7f0ef] sm:mx-0 sm:h-28 sm:w-28">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt={form.pet_name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="space-y-1">
                    <h2 className="text-[18px] font-semibold text-[#30272a]">{form.pet_name}</h2>
                    <p className="text-[11px] text-[#8b7d7e]">
                      Update your pet&apos;s photo and key identifiers to keep their profile current.
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#f0dede] bg-white px-3 text-[12px] font-medium text-[#ab3d42] hover:bg-[#fff7f7]">
                      Change Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                    <span className="inline-flex items-center rounded-md bg-[#fff2f2] px-3 py-2 text-[11px] text-[#b54a50]">
                      {pet.species} • {pet.breed}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSave();
              }}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_340px]">
                <div className="space-y-4">
                  <div className="rounded-[16px] bg-[#fff6f6] p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                      <span aria-hidden>◌</span>
                      Basic information
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldGroup error={errors.pet_name}>
                        <FieldLabel>Pet Name</FieldLabel>
                        <input
                          value={form.pet_name}
                          onChange={(event) => setValue("pet_name", event.target.value)}
                          className={inputClass}
                        />
                      </FieldGroup>

                      <FieldGroup error={errors.species}>
                        <FieldLabel>Species</FieldLabel>
                        <select
                          value={form.species}
                          onChange={(event) => setValue("species", event.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select species</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                          <option value="Other">Other</option>
                        </select>
                      </FieldGroup>

                      <FieldGroup error={errors.breed}>
                        <FieldLabel>Breed</FieldLabel>
                        <input
                          value={form.breed}
                          onChange={(event) => setValue("breed", event.target.value)}
                          className={inputClass}
                        />
                      </FieldGroup>

                      <FieldGroup error={errors.age}>
                        <FieldLabel>Age</FieldLabel>
                        <input
                          value={form.age}
                          onChange={(event) => setValue("age", event.target.value)}
                          className={inputClass}
                        />
                      </FieldGroup>

                      <FieldGroup error={errors.gender}>
                        <FieldLabel>Gender</FieldLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ["Male", "Male"],
                            ["Female", "Female"],
                          ].map(([label, value]) => (
                            <label
                              key={value}
                              className={`flex h-10 cursor-pointer items-center justify-center rounded-md border px-3 text-[13px] ${
                                form.gender === value
                                  ? "border-[#c96f73] bg-[#fff2f2] text-[#b54a50]"
                                  : "border-[#eedddd] bg-white text-[#5e5152]"
                              }`}
                            >
                              <input
                                type="radio"
                                name="gender"
                                className="sr-only"
                                checked={form.gender === value}
                                onChange={() => setValue("gender", value)}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </FieldGroup>

                      <FieldGroup error={errors.weight_kg}>
                        <FieldLabel>Weight (kg)</FieldLabel>
                        <input
                          value={form.weight_kg}
                          onChange={(event) => setValue("weight_kg", event.target.value)}
                          className={inputClass}
                        />
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                  <div className="rounded-[16px] bg-[#fff6f6] p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                      <span aria-hidden>◌</span>
                      About Pet
                    </h2>
                    <FieldGroup error={errors.about}>
                      <FieldLabel>About Pet</FieldLabel>
                      <textarea
                        value={form.about}
                        onChange={(event) => setValue("about", event.target.value)}
                        rows={6}
                        className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]"
                      />
                    </FieldGroup>
                  </div>
                  <div className="rounded-[16px] bg-[#fff6f6] p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                      <span aria-hidden>◌</span>
                      Care Instructions
                    </h2>
                    <FieldGroup error={errors.care_instructions}>
                      <FieldLabel>Care Instructions</FieldLabel>
                      <textarea
                        value={form.care_instructions}
                        onChange={(event) => setValue("care_instructions", event.target.value)}
                        rows={6}
                        className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]"
                      />
                    </FieldGroup>
                  </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  href={`/owner/pets/${petId}`}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#eedddd] bg-white px-5 text-[13px] font-medium text-[#7a6768] transition hover:bg-[#fff8f8]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#b54a50] px-5 text-[13px] font-medium text-white transition hover:bg-[#a94046] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {saveMessage ? (
                <p className="pt-2 text-right text-[11px] font-medium text-[#2d8f68]">{saveMessage}</p>
              ) : null}
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
