"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState, type ReactNode } from "react";
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
  medical_report: string | null;
  medical_notes: string | null;
  created_date: string;
};

type EditPetForm = {
  pet_name: string;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight_kg: string;
  about: string;
  medications: string;
  care_instructions: string;
  sterilized: string;
  last_dental_check: string;
};

type FormErrors = Partial<Record<keyof EditPetForm, string>>;

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="block text-[14px] font-semibold text-[#8b7072]">{children}</span>;
}

function FieldGroup({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error ? <p className="text-[12px] text-[#c24a50]">{error}</p> : null}
    </div>
  );
}

function isImageLikeSource(source: string) {
  return /\.(png|jpe?g|webp|gif|bmp|avif)(\?.*)?$/i.test(source) || source.startsWith("blob:");
}

function validatePetAge(value: string) {
  const trimmed = value.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return false;
  const age = Number(trimmed);
  return age > 0 && age <= 30;
}

function validatePetWeight(value: string) {
  const trimmed = value.trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(trimmed)) return false;
  const weight = Number(trimmed);
  return weight > 0 && weight <= 200;
}

function validatePetFile(file: File | null, maxSizeMB = 5) {
  if (!file) return "";
  if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "application/pdf"].includes(file.type)) {
    return "Please upload a valid image or PDF file.";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be ${maxSizeMB}MB or less.`;
  }
  return "";
}

async function uploadPetAsset(file: File) {
  let response: Response | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      response = await fetch("/api/pets/uploads", {
        method: "POST",
        body: formData,
      });

      if (response.ok) break;
    } catch {
      // Retry once below.
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!response || !response.ok) {
    throw new Error("Could not upload file. Please try again.");
  }

  const data = await response.json();
  return data.url as string;
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
    medications: "",
    care_instructions: "",
    sterilized: "",
    last_dental_check: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [medicalReportFile, setMedicalReportFile] = useState<File | null>(null);
  const [medicalReportPreview, setMedicalReportPreview] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof EditPetForm, boolean>>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadPet() {
      setLoading(true);
      setLoadError("");

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
      gender: pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1).toLowerCase() : "",
      age: pet.age != null ? String(pet.age) : "",
      weight_kg: pet.weight_kg ?? "",
      about: notes.about,
      medications: notes.medications,
      care_instructions: notes.careInstructions,
      sterilized: notes.sterilized,
      last_dental_check: notes.lastDentalVaccination,
    });

    setPhotoFile(null);
    setPhotoPreview(pet.photo ?? "");
    setMedicalReportFile(null);
    setMedicalReportPreview(pet.medical_report ?? "");
  }, [pet]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      if (medicalReportPreview.startsWith("blob:")) {
        URL.revokeObjectURL(medicalReportPreview);
      }
    };
  }, [medicalReportPreview]);

  const validationMessages = useMemo(
    () => ({
      pet_name: "Pet name is required.",
      species: "Species is required.",
      breed: "Breed is required.",
      gender: "Gender is required.",
      age: "Age must be a whole number between 1 and 30.",
      weight_kg: "Weight must be between 0.1 and 200 kg.",
      about: "About pet is required.",
      medications: "Medications must be 500 characters or less.",
      care_instructions: "Care instructions must be 500 characters or less.",
      sterilized: "Sterilization status is required.",
      last_dental_check: "Please choose today or an earlier date.",
    }),
    [],
  );

  const validateFieldValue = (key: keyof EditPetForm, nextForm: EditPetForm = form) => {
    switch (key) {
      case "pet_name": {
        if (!nextForm.pet_name.trim()) return validationMessages.pet_name;
        if (nextForm.pet_name.trim().length < 2 || nextForm.pet_name.trim().length > 60) return "Pet name must be between 2 and 60 characters.";
        return undefined;
      }
      case "species": {
        if (!nextForm.species.trim()) return validationMessages.species;
        return undefined;
      }
      case "breed": {
        if (!nextForm.breed.trim()) return validationMessages.breed;
        if (nextForm.breed.trim().length < 2 || nextForm.breed.trim().length > 50) return "Breed must be between 2 and 50 characters.";
        return undefined;
      }
      case "gender": {
        if (!nextForm.gender.trim()) return validationMessages.gender;
        return undefined;
      }
      case "age": {
        if (!nextForm.age.trim()) return validationMessages.age;
        if (!validatePetAge(nextForm.age)) return validationMessages.age;
        return undefined;
      }
      case "weight_kg": {
        if (!nextForm.weight_kg.trim()) return validationMessages.weight_kg;
        if (!validatePetWeight(nextForm.weight_kg)) return validationMessages.weight_kg;
        return undefined;
      }
      case "about": {
        if (!nextForm.about.trim()) return validationMessages.about;
        if (nextForm.about.trim().length > 500) return "About pet must be 500 characters or less.";
        return undefined;
      }
      case "medications": {
        if (nextForm.medications.trim().length > 500) return validationMessages.medications;
        return undefined;
      }
      case "care_instructions": {
        if (nextForm.care_instructions.trim().length > 500) return validationMessages.care_instructions;
        return undefined;
      }
      case "sterilized": {
        if (!nextForm.sterilized.trim()) return validationMessages.sterilized;
        return undefined;
      }
      case "last_dental_check": {
        if (nextForm.last_dental_check && nextForm.last_dental_check > new Date().toISOString().split("T")[0]) {
          return validationMessages.last_dental_check;
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const setValue = (key: keyof EditPetForm, value: string) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);

    if (touched[key]) {
      const nextError = validateFieldValue(key, nextForm);
      setErrors((current) => ({ ...current, [key]: nextError || undefined }));
    } else {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }

    setSaveMessage("");
  };

  const handleFieldBlur = (key: keyof EditPetForm) => {
    setTouched((current) => ({ ...current, [key]: true }));
    const nextError = validateFieldValue(key, form);
    setErrors((current) => ({ ...current, [key]: nextError || undefined }));
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.pet_name.trim()) {
      nextErrors.pet_name = validationMessages.pet_name;
    } else if (form.pet_name.trim().length < 2 || form.pet_name.trim().length > 60) {
      nextErrors.pet_name = "Pet name must be between 2 and 60 characters.";
    }

    if (!form.species.trim()) {
      nextErrors.species = validationMessages.species;
    }

    if (!form.breed.trim()) {
      nextErrors.breed = validationMessages.breed;
    } else if (form.breed.trim().length < 2 || form.breed.trim().length > 50) {
      nextErrors.breed = "Breed must be between 2 and 50 characters.";
    }

    if (!form.gender.trim()) {
      nextErrors.gender = validationMessages.gender;
    }

    if (!form.age.trim()) {
      nextErrors.age = validationMessages.age;
    } else if (!validatePetAge(form.age)) {
      nextErrors.age = validationMessages.age;
    }

    if (!form.weight_kg.trim()) {
      nextErrors.weight_kg = validationMessages.weight_kg;
    } else if (!validatePetWeight(form.weight_kg)) {
      nextErrors.weight_kg = validationMessages.weight_kg;
    }

    if (!form.about.trim()) {
      nextErrors.about = validationMessages.about;
    } else if (form.about.trim().length > 500) {
      nextErrors.about = "About pet must be 500 characters or less.";
    }

    if (form.medications.trim().length > 500) {
      nextErrors.medications = validationMessages.medications;
    }

    if (form.care_instructions.trim().length > 500) {
      nextErrors.care_instructions = validationMessages.care_instructions;
    }

    if (!form.sterilized.trim()) {
      nextErrors.sterilized = validationMessages.sterilized;
    }

    if (form.last_dental_check && form.last_dental_check > new Date().toISOString().split("T")[0]) {
      nextErrors.last_dental_check = validationMessages.last_dental_check;
    }

    if (photoFile) {
      const photoError = validatePetFile(photoFile, 5);
      if (photoError) {
        nextErrors.pet_name = nextErrors.pet_name || photoError;
      }
    }

    if (medicalReportFile) {
      const reportError = validatePetFile(medicalReportFile, 10);
      if (reportError) {
        nextErrors.medications = nextErrors.medications || reportError;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const payload: Record<string, unknown> = {
        pet_name: form.pet_name,
        species: form.species,
        breed: form.breed,
        gender: form.gender.toLowerCase(),
        age: form.age ? Number(form.age) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
        medical_notes: combinePetNotes(
          form.about,
          form.care_instructions,
          form.medications,
          form.sterilized,
          form.last_dental_check,
        ),
      };

      if (photoFile) {
        payload.photo = await uploadPetAsset(photoFile);
      }

      if (medicalReportFile) {
        payload.medical_report = await uploadPetAsset(medicalReportFile);
      }

      const response = await fetch(`/api/pets/${encodeURIComponent(petId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

    const photoError = validatePetFile(file, 5);
    if (photoError) {
      setErrors((current) => ({ ...current, pet_name: current.pet_name || photoError }));
      return;
    }

    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setSaveMessage("");
    setErrors((current) => ({ ...current, pet_name: undefined }));
  };

  const handleMedicalReportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reportError = validatePetFile(file, 10);
    if (reportError) {
      setErrors((current) => ({ ...current, medications: current.medications || reportError }));
      return;
    }

    if (medicalReportPreview.startsWith("blob:")) {
      URL.revokeObjectURL(medicalReportPreview);
    }

    setMedicalReportFile(file);
    setMedicalReportPreview(URL.createObjectURL(file));
    setSaveMessage("");
    setErrors((current) => ({ ...current, medications: undefined }));
  };

  const inputClass =
    "h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[14px] text-[#403537] outline-none focus:border-[#c96f73]";

  const sterilizationLabel = {
    yes: "Yes — Neutered/Spayed",
    no: "No — Not sterilized",
    unknown: "Unknown",
  } as const;

  const certificateSource = medicalReportFile?.type.startsWith("image/")
    ? "image"
    : medicalReportFile?.type === "application/pdf"
      ? "pdf"
      : isImageLikeSource(medicalReportPreview)
        ? "image"
        : medicalReportPreview.endsWith(".pdf")
          ? "pdf"
          : "none";

  const shell = (content: ReactNode) => (
    <div className="flex min-h-screen bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        {content}
      </div>
    </div>
  );

  if (loading) {
    return shell(<div className="p-6">Loading pet...</div>);
  }

  if (loadError) {
    return shell(<div className="p-6">{loadError}</div>);
  }

  if (!pet) {
    return shell(<div className="p-6">Pet not found.</div>);
  }

  return shell(
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
            <h1 className="page-title text-[#30272a]">
              Edit Pet Profile
            </h1>
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
                <p className="text-[16px] text-[#8b7d7e]">
                  Update your pet&apos;s photo and key identifiers to keep their profile current.
                </p>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#f0dede] bg-white px-3 text-[12px] font-medium text-[#ab3d42] hover:bg-[#fff7f7]">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
                <span className="inline-flex items-center rounded-md bg-[#fff2f2] px-3 py-2 text-[12px] text-[#b54a50]">
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
                <h2 className="mb-4 flex items-center gap-2 text-[20px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  Basic information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup error={errors.pet_name}>
                    <FieldLabel>Pet Name</FieldLabel>
                    <input
                      value={form.pet_name}
                      onChange={(event) => setValue("pet_name", event.target.value)}
                      onBlur={() => handleFieldBlur("pet_name")}
                      className={inputClass}
                    />
                  </FieldGroup>

                  <FieldGroup error={errors.species}>
                    <FieldLabel>Species</FieldLabel>
                    <select
                      value={form.species}
                      onChange={(event) => setValue("species", event.target.value)}
                      onBlur={() => handleFieldBlur("species")}
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
                      onBlur={() => handleFieldBlur("breed")}
                      className={inputClass}
                    />
                  </FieldGroup>

                  <FieldGroup error={errors.age}>
                    <FieldLabel>Age</FieldLabel>
                    <input
                      value={form.age}
                      onChange={(event) => setValue("age", event.target.value)}
                      onBlur={() => handleFieldBlur("age")}
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
                      onBlur={() => handleFieldBlur("weight_kg")}
                      className={inputClass}
                    />
                  </FieldGroup>
                </div>
              </div>

              <div className="rounded-[16px] bg-[#fff6f6] p-4">
                <h2 className="mb-4 flex items-center gap-2 text-[20px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  About Pet
                </h2>
                <FieldGroup error={errors.about}>
                  <FieldLabel>About Pet *</FieldLabel>
                  <textarea
                    value={form.about}
                    onChange={(event) => setValue("about", event.target.value)}
                    onBlur={() => handleFieldBlur("about")}
                    rows={6}
                    className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[14px] text-[#403537] outline-none focus:border-[#c96f73]"
                  />
                </FieldGroup>

                <div className="mt-4 rounded-[16px] bg-[#fff6f6]">
                  <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                    <span aria-hidden>◌</span>
                    Medications
                  </h3>

                  <FieldGroup error={errors.medications}>
                    <FieldLabel>Medications</FieldLabel>
                    <textarea
                      value={form.medications}
                      onChange={(event) => setValue("medications", event.target.value)}
                      onBlur={() => handleFieldBlur("medications")}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[14px] text-[#403537] outline-none focus:border-[#c96f73]"
                      placeholder="List any medications your pet is taking"
                    />
                  </FieldGroup>
                </div>
              </div>

              <div className="rounded-[16px] bg-[#fff6f6] p-4">
                <h2 className="mb-4 flex items-center gap-2 text-[20px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  Care Instructions
                </h2>
                <FieldGroup error={errors.care_instructions}>
                  <FieldLabel>Care Instructions</FieldLabel>
                  <textarea
                    value={form.care_instructions}
                    onChange={(event) => setValue("care_instructions", event.target.value)}
                    onBlur={() => handleFieldBlur("care_instructions")}
                    rows={6}
                    className="mt-1 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[14px] text-[#403537] outline-none focus:border-[#c96f73]"
                  />
                </FieldGroup>
              </div>
            </div>

            <aside className="space-y-4">
              <section className="rounded-[16px] bg-[#fff6f6] p-4">
                <h2 className="mb-4 flex items-center gap-2 text-[20px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  Medical Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <FieldLabel>Sterilization Status</FieldLabel>
                    <div className="mt-3 grid gap-2">
                      {[
                        { value: "yes", label: "Yes — Neutered/Spayed" },
                        { value: "no", label: "No — Not sterilized" },
                        { value: "unknown", label: "Unknown" },
                      ].map((option) => {
                        const selected = form.sterilized === option.value;

                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${selected ? "border-[#d96a6d] bg-[#fff3f2]" : "border-[#e9d7d7] bg-white"}`}
                          >
                            <span className={`flex size-4 items-center justify-center rounded-full border ${selected ? "border-[#c84e52] bg-[#c84e52]" : "border-[#b9a5a5] bg-white"}`}>
                              {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                            </span>
                            <span className="text-[13px] font-medium text-[#2f2a2b]">{option.label}</span>
                            <input
                              type="radio"
                              name="sterilized-field"
                              value={option.value}
                              checked={selected}
                              onChange={() => setValue("sterilized", option.value)}
                              onBlur={() => handleFieldBlur("sterilized")}
                              className="sr-only"
                            />
                          </label>
                        );
                      })}
                    </div>
                    {errors.sterilized ? <p className="mt-2 text-[12px] text-[#c24a50]">{errors.sterilized}</p> : null}
                  </div>

                  <FieldGroup error={errors.last_dental_check}>
                    <FieldLabel>Last Dental / Vaccination</FieldLabel>
                    <input
                      type="date"
                      value={form.last_dental_check}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(event) => setValue("last_dental_check", event.target.value)}
                      onBlur={() => handleFieldBlur("last_dental_check")}
                      className={inputClass}
                    />
                  </FieldGroup>
                </div>
              </section>

              <section className="rounded-[16px] bg-[#fff6f6] p-4">
                <h2 className="mb-4 flex items-center gap-2 text-[20px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  Vaccination Records
                </h2>

                <div className="rounded-[14px] border border-[#f0dede] bg-white p-3">
                  <FieldLabel>Current Certificate</FieldLabel>

                  <div className="mt-3 overflow-hidden rounded-xl border border-[#f0dede] bg-[#fff8f7]">
                    {medicalReportPreview && certificateSource === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={medicalReportPreview}
                        alt={`${form.pet_name || "Pet"} vaccination record`}
                        className="h-56 w-full object-cover"
                      />
                    ) : medicalReportPreview ? (
                      <div className="flex h-56 flex-col items-center justify-center px-4 text-center text-[14px] text-[#9f8e8f]">
                        <div className="rounded-full bg-[#fff1f1] px-3 py-2 text-[12px] font-semibold text-[#b54a50]">
                          Vaccination document
                        </div>
                        <p className="mt-3 max-w-[220px]">
                          {medicalReportFile?.name || "Current certificate uploaded"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-56 items-center justify-center px-4 text-center text-[14px] text-[#9f8e8f]">
                        No vaccination certificate uploaded yet.
                      </div>
                    )}
                  </div>

                <label className="mt-3 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#f0dede] bg-white px-3 text-[12px] font-medium text-[#ab3d42] hover:bg-[#fff7f7]">
                  Replace Document
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleMedicalReportChange} />
                </label>

                  <p className="mt-3 text-[12px] text-[#8f7f80]">Accepted format: JPEG, PNG, WEBP, or PDF.</p>
                </div>
              </section>
            </aside>
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
            <p className="pt-2 text-right text-[12px] font-medium text-[#2d8f68]">{saveMessage}</p>
          ) : null}
        </form>
      </section>
    </main>,
  );
}
