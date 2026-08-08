"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "../../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../../components/owner-dashboard/owner-sidebar";
import { pets as samplePets } from "../../../../../lib/owner-dashboard-data";

type EditablePet = {
  id: number;
  name: string;
  image: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  weightKg: string;
  colorMarkings: string;
  aboutBio: string;
  careInstructions: string;
  lastVaccinationDate: string;
  certificateImage: string;
  certificateLabel: string;
  verifiedLabel: string;
};

type EditPetForm = {
  pet_name: string;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight_kg: string;
  color_markings: string;
  about_bio: string;
  care_instructions: string;
  last_vaccination_date: string;
};

type FormErrors = Partial<Record<keyof EditPetForm, string>>;

function determinePetType(breed?: string, name?: string) {
  const b = (breed || "").toLowerCase();
  const catKeywords = ["siamese", "shorthair", "persian", "maine", "ragdoll", "sphynx", "tabby", "balinese", "burmese", "oriental", "cat", "domestic"];
  const dogKeywords = ["retriever", "bulldog", "terrier", "poodle", "beagle", "labrador", "golden", "shepherd", "husky", "samoyed", "spaniel", "dog"];

  if (catKeywords.some((k) => b.includes(k))) return "Cat";
  if (dogKeywords.some((k) => b.includes(k))) return "Dog";
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

function getTodayDateValue() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().split("T")[0];
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <rect x="2.25" y="3.5" width="15.5" height="14.25" rx="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.25 2.5v3M14.75 2.5v3M2.25 7.25h15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

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

const extraPets: EditablePet[] = [
  {
    id: 4,
    name: "Shenu",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=700&q=85",
    species: "Dog",
    breed: "Samoyed",
    age: "4",
    gender: "Female",
    weightKg: "16.4",
    colorMarkings: "White fluffy coat",
    aboutBio: "Shenu is a spirited Samoyed with a confident, cheerful personality and a love for movement and attention.",
    careInstructions: "Shenu needs regular brushing, outdoor exercise, and a clean, well-ventilated resting space.",
    lastVaccinationDate: "2025-04-29",
    certificateImage: "https://images.unsplash.com/photo-1583511655785-6b3f6f4b2b1b?auto=format&fit=crop&w=600&q=80",
    certificateLabel: "Official Pet Vaccination Record",
    verifiedLabel: "Verified Profile",
  },
  {
    id: 5,
    name: "Brownie",
    image: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=700&q=85",
    species: "Dog",
    breed: "French Bulldog",
    age: "2",
    gender: "Male",
    weightKg: "11.2",
    colorMarkings: "Tan coat",
    aboutBio: "Brownie is a cheerful French Bulldog with a friendly attitude and a compact, sturdy build.",
    careInstructions: "Brownie should be kept cool in warm weather and monitored for breathing comfort.",
    lastVaccinationDate: "2025-03-11",
    certificateImage: "https://images.unsplash.com/photo-1583511655785-6b3f6f4b2b1b?auto=format&fit=crop&w=600&q=80",
    certificateLabel: "Official Pet Vaccination Record",
    verifiedLabel: "Verified Profile",
  },
  {
    id: 6,
    name: "Sheba",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=700&q=85",
    species: "Cat",
    breed: "Siamese",
    age: "3",
    gender: "Female",
    weightKg: "4.8",
    colorMarkings: "Cream coat with darker points",
    aboutBio: "Sheba is a graceful Siamese cat with a curious, vocal, and intelligent nature.",
    careInstructions: "Sheba benefits from interactive play, a steady feeding schedule, and a calm indoor environment.",
    lastVaccinationDate: "2025-05-07",
    certificateImage: "https://images.unsplash.com/photo-1583511655785-6b3f6f4b2b1b?auto=format&fit=crop&w=600&q=80",
    certificateLabel: "Official Pet Vaccination Record",
    verifiedLabel: "Verified Profile",
  },
];

function getEditablePet(id: number): EditablePet | null {
  const allPets = [
    ...samplePets.map((pet) => {
      const { breed, age, type } = parseDetails(pet.details, pet.name);
      const defaults: Record<number, Omit<EditablePet, "id" | "name" | "image">> = {
        1: {
          species: type,
          breed,
          age: age || "1",
          gender: "Male",
          weightKg: "15.4",
          colorMarkings: "Golden coat",
          aboutBio: "Cooper is a calm and affectionate Golden Retriever who loves people, walks, and time with family.",
          careInstructions: "Cooper needs regular exercise, clean water, and a balanced diet suited to his active lifestyle.",
          lastVaccinationDate: "2025-05-18",
          certificateImage: "https://images.unsplash.com/photo-1583511655785-6b3f6f4b2b1b?auto=format&fit=crop&w=600&q=80",
          certificateLabel: "Official Pet Vaccination Record",
          verifiedLabel: "Verified Profile",
        },
        2: {
          species: type,
          breed,
          age: age || "2",
          gender: "Female",
          weightKg: "5.4",
          colorMarkings: "Cream fur with darker points",
          aboutBio: "Luna is a vibrant and energetic Samoyed who embodies the Sammie Smile.",
          careInstructions: "Luna requires specific care to stay healthy and happy because of her strict allergies.",
          lastVaccinationDate: "2025-05-14",
          certificateImage: "https://images.unsplash.com/photo-1583511655785-6b3f6f4b2b1b?auto=format&fit=crop&w=600&q=80",
          certificateLabel: "Official Pet Vaccination Record",
          verifiedLabel: "Verified Profile",
        },
        3: {
          species: type,
          breed,
          age: age || "5",
          gender: "Female",
          weightKg: "4.2",
          colorMarkings: "Gray shorthair coat",
          aboutBio: "Misty is a curious Domestic Shorthair with a playful and observant nature.",
          careInstructions: "Misty does best with a predictable feeding routine, fresh water, and a quiet litter area.",
          lastVaccinationDate: "2025-06-02",
          certificateImage: "https://images.unsplash.com/photo-1583511655785-6b3f6f4b2b1b?auto=format&fit=crop&w=600&q=80",
          certificateLabel: "Official Pet Vaccination Record",
          verifiedLabel: "Verified Profile",
        },
      };

      return {
        id: pet.id,
        name: pet.name,
        image: pet.image,
        ...defaults[pet.id as 1 | 2 | 3],
      };
    }),
    ...extraPets,
  ];

  return allPets.find((pet) => pet.id === id) || null;
}

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const todayDateValue = getTodayDateValue();
  const { id } = use(params);
  const petId = Number(id);
  const pet = useMemo(() => getEditablePet(petId), [petId]);

  const [form, setForm] = useState<EditPetForm>({
    pet_name: "",
    species: "",
    breed: "",
    gender: "",
    age: "",
    weight_kg: "",
    color_markings: "",
    about_bio: "",
    care_instructions: "",
    last_vaccination_date: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!pet) return;
    setForm({
      pet_name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      age: pet.age,
      weight_kg: pet.weightKg,
      color_markings: pet.colorMarkings,
      about_bio: pet.aboutBio,
      care_instructions: pet.careInstructions,
      last_vaccination_date: pet.lastVaccinationDate,
    });
    setPhotoPreview(pet.image);
    setCertificatePreview(pet.certificateImage);
  }, [pet]);

  const validationMessages = useMemo(
    () => ({
      pet_name: "Pet name is required.",
      species: "Species is required.",
      breed: "Breed is required.",
      gender: "Gender is required.",
      age: "Age is required.",
      weight_kg: "Weight is required.",
      color_markings: "Color / markings are required.",
      about_bio: "About / bio is required.",
      care_instructions: "Care instructions are required.",
      last_vaccination_date: "Last vaccination date is required.",
    }),
    [],
  );

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
      if (certificatePreview.startsWith("blob:")) URL.revokeObjectURL(certificatePreview);
    };
  }, [photoPreview, certificatePreview]);

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

  const setValue = (key: keyof EditPetForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveMessage("");
  };

  const setFilePreview = (file: File, setter: (value: string) => void, field: "pet_name" | "species") => {
    const nextPreview = URL.createObjectURL(file);
    setter(nextPreview);
    setSaveMessage("");
    if (field === "pet_name") {
      setErrors((current) => ({ ...current, pet_name: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    (Object.keys(validationMessages) as Array<keyof typeof validationMessages>).forEach((key) => {
      if (!String(form[key]).trim()) {
        nextErrors[key] = validationMessages[key];
      }
    });

    if (form.last_vaccination_date && form.last_vaccination_date > todayDateValue) {
      nextErrors.last_vaccination_date = "Please choose today or an earlier date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    console.log("Edit pet form data:", { id: petId, ...form, photoPreview, certificatePreview });
    setSaveMessage("Changes saved locally. Check the console for the updated data.");
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFilePreview(file, setPhotoPreview, "pet_name");
  };

  const handleCertificateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFilePreview(file, setCertificatePreview, "species");
  };

  const inputClass = "h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]";

  return (
    <div className="min-h-screen flex bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />

        <main className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#4f4143]">
                <button type="button" onClick={() => router.back()} className="text-[18px] font-semibold leading-none hover:text-[#ab3d42]" aria-label="Back to pet profile">
                  <span aria-hidden>‹</span>
                </button>
                <h1 className="page-title">Edit Pet Profile</h1>
              </div>
              <p className="page-subtitle mt-1 text-[#9f8e8f]">Keep your pet's information up to date to ensure safe, personalized, and loving care.</p>
            </div>
          </div>

          <section className="w-full rounded-[18px] border border-[#f3dede] bg-white px-5 py-6 shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:px-6">
            <div className="mb-6 rounded-[18px] border border-[#f2e2e2] bg-[#fffafa] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-[#f1dede] bg-[#f7f0ef] sm:mx-0 sm:h-28 sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview || pet.image} alt={form.pet_name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="space-y-1">
                    <h2 className="text-[18px] font-semibold text-[#30272a]">{form.pet_name}</h2>
                    <p className="text-[11px] text-[#8b7d7e]">Update your pet's photo and key identifiers to keep their profile current.</p>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#f0dede] bg-white px-3 text-[12px] font-medium text-[#ab3d42] hover:bg-[#fff7f7]">
                      Change Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                    <span className="inline-flex items-center rounded-md bg-[#fff2f2] px-3 py-2 text-[11px] text-[#b54a50]">{pet.species} • {pet.breed}</span>
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
                        <input value={form.pet_name} onChange={(event) => setValue("pet_name", event.target.value)} className={inputClass} />
                      </FieldGroup>

                      <FieldGroup error={errors.species}>
                        <FieldLabel>Species</FieldLabel>
                        <select value={form.species} onChange={(event) => setValue("species", event.target.value)} className={inputClass}>
                          <option value="">Select species</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                          <option value="Other">Other</option>
                        </select>
                      </FieldGroup>

                      <FieldGroup error={errors.breed}>
                        <FieldLabel>Breed</FieldLabel>
                        <input value={form.breed} onChange={(event) => setValue("breed", event.target.value)} className={inputClass} />
                      </FieldGroup>

                      <FieldGroup error={errors.age}>
                        <FieldLabel>Age</FieldLabel>
                        <input value={form.age} onChange={(event) => setValue("age", event.target.value)} className={inputClass} />
                      </FieldGroup>

                      <FieldGroup error={errors.gender}>
                        <FieldLabel>Gender</FieldLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ["Male", "Male"],
                            ["Female", "Female"],
                          ].map(([label, value]) => (
                            <label key={value} className={`flex h-10 cursor-pointer items-center justify-center rounded-md border px-3 text-[13px] ${form.gender === value ? "border-[#c96f73] bg-[#fff2f2] text-[#b54a50]" : "border-[#eedddd] bg-white text-[#5e5152]"}`}>
                              <input type="radio" name="gender" className="sr-only" checked={form.gender === value} onChange={() => setValue("gender", value)} />
                              {label}
                            </label>
                          ))}
                        </div>
                      </FieldGroup>

                      <FieldGroup error={errors.weight_kg}>
                        <FieldLabel>Weight (kg)</FieldLabel>
                        <input value={form.weight_kg} onChange={(event) => setValue("weight_kg", event.target.value)} className={inputClass} />
                      </FieldGroup>

                      <div className="sm:col-span-2">
                        <FieldGroup error={errors.color_markings}>
                          <FieldLabel>Color / Markings</FieldLabel>
                          <input value={form.color_markings} onChange={(event) => setValue("color_markings", event.target.value)} className={inputClass} />
                        </FieldGroup>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-[#fff6f6] p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                      <span aria-hidden>◌</span>
                      Personality & Bio
                    </h2>
                    <FieldGroup error={errors.about_bio}>
                      <FieldLabel>About / Bio</FieldLabel>
                      <textarea value={form.about_bio} onChange={(event) => setValue("about_bio", event.target.value)} rows={6} className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" />
                    </FieldGroup>
                  </div>

                  <div className="rounded-[16px] bg-[#fff6f6] p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                      <span aria-hidden>◌</span>
                      Care Instructions
                    </h2>
                    <FieldGroup error={errors.care_instructions}>
                      <FieldLabel>Detailed Care Narrative</FieldLabel>
                      <textarea value={form.care_instructions} onChange={(event) => setValue("care_instructions", event.target.value)} rows={7} className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" />
                    </FieldGroup>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[16px] bg-[#fff6f6] p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                      <span aria-hidden>◌</span>
                      Vaccination Records
                    </h2>

                    <div className="rounded-[14px] border border-dashed border-[#e8c7c7] bg-white p-3">
                      <div className="overflow-hidden rounded-[10px] bg-[#f7f0ef]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={certificatePreview || pet.certificateImage} alt="Current certificate" className="h-32 w-full object-cover" />
                      </div>
                      <label className="mt-3 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#f0dede] bg-white px-3 text-[12px] font-medium text-[#ab3d42] hover:bg-[#fff7f7]">
                        Replace Document
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCertificateChange} />
                      </label>

                      <div className="mt-4 space-y-2 rounded-[12px] bg-[#fffafa] p-3">
                        <FieldGroup error={errors.last_vaccination_date}>
                          <FieldLabel>Date of Last Vaccination</FieldLabel>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#b54a50]">
                              <CalendarIcon />
                            </span>
                            <input type="date" max={todayDateValue} value={form.last_vaccination_date} onChange={(event) => setValue("last_vaccination_date", event.target.value)} className="h-10 w-full rounded-md border border-[#eedddd] bg-white pl-9 pr-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" />
                          </div>
                        </FieldGroup>

                        <div className="rounded-md bg-[#edf9f4] p-3 text-[11px] text-[#2d8f68]">
                          <div className="font-semibold">{pet.verifiedLabel}</div>
                          <div className="mt-1 text-[#5d8575]">This profile has been reviewed and verified by Animal Care.</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href={`/owner/pets/${pet.id}`} className="inline-flex h-10 items-center justify-center rounded-md border border-[#eedddd] bg-white px-5 text-[13px] font-medium text-[#7a6768] transition hover:bg-[#fff8f8]">
                  Cancel
                </Link>
                <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-[#b54a50] px-5 text-[13px] font-medium text-white transition hover:bg-[#a94046]">
                  Save Changes
                </button>
              </div>

              {saveMessage ? <p className="pt-2 text-right text-[11px] font-medium text-[#2d8f68]">{saveMessage}</p> : null}
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
