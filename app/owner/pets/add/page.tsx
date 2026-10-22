"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { combinePetNotes } from "../../../../lib/pet-notes";

type AddPetForm = {
  pet_name: string;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight_kg: string;
  photo: string;
  medical_report: string;
  about: string;
  sterilized: string;
  last_dental_check: string;
  medications: string;
  care_instructions: string;
};

const initialForm: AddPetForm = {
  pet_name: "",
  species: "",
  breed: "",
  gender: "",
  age: "",
  weight_kg: "",
  photo: "",
  medical_report: "",
  about: "",
  sterilized: "",
  last_dental_check: "",
  medications: "",
  care_instructions: "",
};

type FormErrors = Partial<Record<keyof AddPetForm, string>>;
type TouchedFields = Partial<Record<keyof AddPetForm, boolean>>;

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

function getTodayDateValue() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().split("T")[0];
}

const allowedSpecies = ["Dog", "Cat", "Bird", "Other"] as const;

function normalizeText(value: string) {
  return value.trim();
}

function validatePetAge(value: string) {
  const trimmed = normalizeText(value);
  if (!/^\d{1,2}$/.test(trimmed)) return false;
  const age = Number(trimmed);
  return age > 0 && age <= 100;
}

function validatePetWeight(value: string) {
  const trimmed = normalizeText(value);
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
      <rect x="2.25" y="3.5" width="15.5" height="14.25" rx="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.25 2.5v3M14.75 2.5v3M2.25 7.25h15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 11h2M10 11h2M14 11h0M6 14h2M10 14h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function AddPetPage() {
  const router = useRouter();
  const [form, setForm] = useState<AddPetForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [medicalReportFile, setMedicalReportFile] = useState<File | null>(null);
  const [medicalReportPreview, setMedicalReportPreview] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({});
  const todayDateValue = getTodayDateValue();

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      if (medicalReportPreview) {
        URL.revokeObjectURL(medicalReportPreview);
      }
    };
  }, [photoPreview, medicalReportPreview]);

  const validationMessages = useMemo(
    () => ({
      pet_name: "Pet name is required.",
      species: "Species is required.",
      breed: "Breed is required.",
      gender: "Gender is required.",
      age: "Age must be a whole number between 1 and 100.",
      weight_kg: "Weight must be between 0.1 and 200 kg.",
      sterilized: "Sterilization status is required.",
      about: "About pet is required.",
      medications: "Medications must be 500 characters or less.",
      care_instructions: "Care instructions must be 1000 characters or less.",
      last_dental_check: "Please choose today or an earlier date.",
    }),
    [],
  );

  const validateFieldValue = (key: keyof AddPetForm, nextForm: AddPetForm = form) => {
    const value = nextForm[key];

    switch (key) {
      case "pet_name": {
        if (!normalizeText(value)) return validationMessages.pet_name;
        if (normalizeText(value).length < 2 || normalizeText(value).length > 60) return "Pet name must be between 2 and 60 characters.";
        return undefined;
      }
      case "species": {
        if (!normalizeText(value)) return validationMessages.species;
        if (!allowedSpecies.includes(value as (typeof allowedSpecies)[number])) return "Please choose a valid species.";
        return undefined;
      }
      case "breed": {
        if (!normalizeText(value)) return validationMessages.breed;
        if (normalizeText(value).length < 2 || normalizeText(value).length > 50) return "Breed must be between 2 and 50 characters.";
        return undefined;
      }
      case "gender": {
        if (!normalizeText(value)) return validationMessages.gender;
        return undefined;
      }
      case "age": {
        if (!normalizeText(value)) return validationMessages.age;
        if (!validatePetAge(value)) return validationMessages.age;
        return undefined;
      }
      case "weight_kg": {
        if (!normalizeText(value)) return validationMessages.weight_kg;
        if (!validatePetWeight(value)) return validationMessages.weight_kg;
        return undefined;
      }
      case "sterilized": {
        if (!normalizeText(value)) return validationMessages.sterilized;
        return undefined;
      }
      case "about": {
        if (!value.trim()) return validationMessages.about;
        if (value.trim().length > 2000) return "About pet must be 2000 characters or less.";
        return undefined;
      }
      case "medications": {
        if (value.trim().length > 500) return validationMessages.medications;
        return undefined;
      }
      case "care_instructions": {
        if (value.trim().length > 1000) return validationMessages.care_instructions;
        return undefined;
      }
      case "last_dental_check": {
        if (value && value > todayDateValue) return validationMessages.last_dental_check;
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const setValue = (key: keyof AddPetForm, value: string) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);

    if (touched[key]) {
      const nextMessage = validateFieldValue(key, nextForm);
      setErrors((current) => ({ ...current, [key]: nextMessage || undefined }));
    } else {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }

    setSaveMessage("");
    setSubmitError("");
  };

  const handleFieldBlur = (key: keyof AddPetForm) => {
    setTouched((current) => ({ ...current, [key]: true }));
    const nextMessage = validateFieldValue(key, form);
    setErrors((current) => ({ ...current, [key]: nextMessage || undefined }));
  };

  const setFileValue = (
    key: "photo" | "medical_report",
    file: File,
    setPreview: (value: string) => void,
  ) => {
    const fileError = validatePetFile(file, key === "photo" ? 5 : 10);
    setErrors((current) => ({
      ...current,
      [key]: fileError || undefined,
    }));

    if (fileError) {
      setPreview("");
      if (key === "photo") {
        setPhotoFile(null);
      }
      if (key === "medical_report") {
        setMedicalReportFile(null);
      }
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);

    if (key === "photo") {
      setPhotoFile(file);
    }

    if (key === "medical_report") {
      setMedicalReportFile(file);
    }

    setValue(key, file.name);
  };

  const handlePetPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileValue("photo", file, setPhotoPreview);
  };

  const handleMedicalReportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileValue("medical_report", file, setMedicalReportPreview);
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!normalizeText(form.pet_name)) {
      nextErrors.pet_name = validationMessages.pet_name;
    } else if (normalizeText(form.pet_name).length < 2 || normalizeText(form.pet_name).length > 60) {
      nextErrors.pet_name = "Pet name must be between 2 and 60 characters.";
    }

    if (!normalizeText(form.species)) {
      nextErrors.species = validationMessages.species;
    } else if (!allowedSpecies.includes(form.species as (typeof allowedSpecies)[number])) {
      nextErrors.species = "Please choose a valid species.";
    }

    if (!normalizeText(form.breed)) {
      nextErrors.breed = validationMessages.breed;
    } else if (normalizeText(form.breed).length < 2 || normalizeText(form.breed).length > 50) {
      nextErrors.breed = "Breed must be between 2 and 50 characters.";
    }

    if (!normalizeText(form.gender)) {
      nextErrors.gender = validationMessages.gender;
    }

    if (!normalizeText(form.age)) {
      nextErrors.age = validationMessages.age;
    } else if (!validatePetAge(form.age)) {
      nextErrors.age = validationMessages.age;
    }

    if (!normalizeText(form.weight_kg)) {
      nextErrors.weight_kg = validationMessages.weight_kg;
    } else if (!validatePetWeight(form.weight_kg)) {
      nextErrors.weight_kg = validationMessages.weight_kg;
    }

    if (!normalizeText(form.sterilized)) {
      nextErrors.sterilized = validationMessages.sterilized;
    }

    if (!form.about.trim()) {
      nextErrors.about = validationMessages.about;
    } else if (form.about.trim().length > 2000) {
      nextErrors.about = "About pet must be 2000 characters or less.";
    }

    if (form.medications.trim().length > 500) {
      nextErrors.medications = validationMessages.medications;
    }

    if (form.care_instructions.trim().length > 1000) {
      nextErrors.care_instructions = validationMessages.care_instructions;
    }

    if (form.last_dental_check && form.last_dental_check > todayDateValue) {
      nextErrors.last_dental_check = validationMessages.last_dental_check;
    }

    if (photoFile) {
      const photoError = validatePetFile(photoFile, 5);
      if (photoError) nextErrors.photo = photoError;
    }

    if (medicalReportFile) {
      const reportError = validatePetFile(medicalReportFile, 10);
      if (reportError) nextErrors.medical_report = reportError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

const handleSave = async () => {
if (isSaving) return;
if (!validateForm()) return;

setIsSaving(true);
setSubmitError("");

try {
let photoUrl = "";
let medicalReportUrl = "";


// Upload photo first
if (photoFile) {
  let uploadResponse: Response | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const formData = new FormData();
    formData.append("file", photoFile);

    try {
      uploadResponse = await fetch("/api/pets/uploads", {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) break;
    } catch {
      // ignore and retry
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!uploadResponse || !uploadResponse.ok) {
    setSubmitError("Could not upload pet photo. Please try again.");
    return;
  }

  const uploadResult = await uploadResponse.json();
  photoUrl = uploadResult.url;


if (medicalReportFile) {
  let reportResponse: Response | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const reportForm = new FormData();
    reportForm.append("file", medicalReportFile);

    try {
      reportResponse = await fetch("/api/pets/uploads", {
        method: "POST",
        body: reportForm,
      });

      if (reportResponse.ok) break;
    } catch {
      // ignore and retry
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!reportResponse || !reportResponse.ok) {
    setSubmitError("Could not upload vaccination card. Please try again.");
    return;
  }

  const reportResult = await reportResponse.json();
  medicalReportUrl = reportResult.url;
}
}

// Create pet
const payload: Record<string, unknown> = {
  pet_name: form.pet_name,
};

if (form.species.trim()) payload.species = form.species.trim();
if (form.breed.trim()) payload.breed = form.breed.trim();
if (form.gender) payload.gender = form.gender.toLowerCase();
if (form.age.trim()) payload.age = Number(form.age);
if (form.weight_kg.trim()) payload.weight_kg = Number(form.weight_kg);
if (photoUrl) payload.photo = photoUrl;
if (medicalReportUrl) payload.medical_report = medicalReportUrl;

const medicalNotes = combinePetNotes(
  form.about,
  form.care_instructions,
  form.medications,
  form.sterilized,
  form.last_dental_check,
);

if (medicalNotes) {
  payload.medical_notes = medicalNotes;
}

const response = await fetch("/api/pets", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const result = await response.json().catch(() => null);

if (response.status === 400) {
  setSubmitError(result?.message || "Please check the pet details and try again.");
  return;
}

if (response.status !== 201) {
  setSubmitError(result?.message || "Could not create pet. Please try again.");
  return;
}

router.push("/owner/pets");


} catch {
setSubmitError("Could not create pet. Please try again.");
} finally {
setIsSaving(false);
}
};



  return (
<<<<<<< HEAD
    <div className="min-h-[calc(100vh-60px)] bg-[#fff8f7]">
        <main className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-8">
          <div className="mb-4 w-full max-w-[12500px]">
            <div>
              <div className="flex items-center gap-2 text-[#4f4143]">
                <Link href="/owner/pets" className="text-[18px] font-semibold leading-none hover:text-[#ab3d42]">
                  <span aria-hidden>‹</span>
=======
    <div className="flex flex-col min-h-screen bg-[#fff8f7] lg:flex-row">
      <OwnerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5">
              <div>
                <Link href="/owner/pets" className="mb-1 inline-flex items-center gap-1 text-xs text-[#8b7d7e] hover:text-[#ab3d42]">
                  My Pets <span aria-hidden="true">&rsaquo;</span> Add New Pet
>>>>>>> origin/main
                </Link>
                <h1 className="page-title text-[#29252b]">Add New Pet</h1>
              </div>
            </div>

            <form
              id="add-pet-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleSave();
              }}
            >
              <section className="mb-5 rounded-2xl border border-[#f0dada] bg-white p-4 shadow-[0_3px_16px_rgba(117,55,59,0.04)] sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <label className="group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#e8c7c7] bg-[#fff8f7] text-[#a63842] transition hover:border-[#c96f73] sm:size-24">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Pet photo preview" className="size-full object-cover" />
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-center text-[11px] font-medium">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
                          <path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v10H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                          <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        Upload Photo
                      </span>
                    )}
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePetPhotoChange} />
                  </label>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-[#30272a]">Pet Photo</h2>
                      <span className="rounded-full bg-[#fff4f3] px-2 py-0.5 text-[11px] font-medium text-[#9a7476]">Optional</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#857a7d]">
                      Recommended size: 960 × 960 px. JPEG, PNG, WEBP, GIF, or BMP; up to 5 MB.
                    </p>
                    <p className="mt-1 truncate text-xs text-[#8f7f80]">
                      {form.photo ? <>Selected: {form.photo}</> : "No photo selected yet."}
                    </p>
                    {errors.photo ? <p className="mt-1 text-xs text-[#c24a50]">{errors.photo}</p> : null}
                  </div>

                </div>
              </section>

              <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(300px,1fr)]">
                <div className="flex min-w-0 flex-col gap-3 lg:h-full">
                  <section className="rounded-2xl border border-[#f0dada] bg-white p-4 shadow-[0_2px_10px_rgba(117,55,59,0.03)] sm:p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#a63842]">
                      <span aria-hidden="true" className="text-sm">●</span>
                      Basic Information
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldGroup error={errors.pet_name}>
                        <FieldLabel>Pet Name *</FieldLabel>
                        <input value={form.pet_name} onChange={(event) => setValue("pet_name", event.target.value)} onBlur={() => handleFieldBlur("pet_name")} className="h-10 w-full rounded-lg border border-[#eedddd] bg-white px-3 text-sm text-[#403537] outline-none placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. Luna" />
                      </FieldGroup>

                      <FieldGroup error={errors.species}>
                        <FieldLabel>Species *</FieldLabel>
                        <select value={form.species} onChange={(event) => setValue("species", event.target.value)} onBlur={() => handleFieldBlur("species")} className="h-10 w-full rounded-lg border border-[#eedddd] bg-white px-3 text-sm text-[#403537] outline-none focus:border-[#c96f73]">
                          <option value="">Select species</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                          <option value="Other">Other</option>
                        </select>
                      </FieldGroup>

                      <FieldGroup error={errors.breed}>
                        <FieldLabel>Breed *</FieldLabel>
                        <input value={form.breed} onChange={(event) => setValue("breed", event.target.value)} onBlur={() => handleFieldBlur("breed")} className="h-10 w-full rounded-lg border border-[#eedddd] bg-white px-3 text-sm text-[#403537] outline-none placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. Golden Retriever" />
                      </FieldGroup>

                      <FieldGroup error={errors.gender}>
                        <FieldLabel>Gender *</FieldLabel>
                        <div className="grid grid-cols-2 gap-2" onBlur={() => handleFieldBlur("gender")}>
                          {[
                            ["Male", "Male"],
                            ["Female", "Female"],
                          ].map(([label, value]) => (
                            <label key={value} className={form.gender === value ? "flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[#c96f73] bg-[#fff2f2] px-3 text-sm font-semibold text-[#a63842]" : "flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[#eedddd] bg-white px-3 text-sm text-[#5e5152]"}>
                              <input type="radio" name="gender" className="sr-only" checked={form.gender === value} onChange={() => setValue("gender", value)} />
                              {label}
                            </label>
                          ))}
                        </div>
                      </FieldGroup>

                      <FieldGroup error={errors.age}>
                        <FieldLabel>Age (Years) *</FieldLabel>
                        <input value={form.age} onChange={(event) => setValue("age", event.target.value)} onBlur={() => handleFieldBlur("age")} inputMode="numeric" className="h-10 w-full rounded-lg border border-[#eedddd] bg-white px-3 text-sm text-[#403537] outline-none placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. 3" />
                      </FieldGroup>

                      <FieldGroup error={errors.weight_kg}>
                        <FieldLabel>Weight (kg) *</FieldLabel>
                        <input value={form.weight_kg} onChange={(event) => setValue("weight_kg", event.target.value)} onBlur={() => handleFieldBlur("weight_kg")} inputMode="decimal" className="h-10 w-full rounded-lg border border-[#eedddd] bg-white px-3 text-sm text-[#403537] outline-none placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. 15.4" />
                      </FieldGroup>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#f0dada] bg-white p-3 shadow-[0_2px_10px_rgba(117,55,59,0.03)] sm:p-4">
                    <h2 className="mb-4 text-lg font-semibold text-[#a63842]">About Pet</h2>
                    <FieldGroup error={errors.about}>
                      <textarea aria-label="About Pet" value={form.about} onChange={(event) => setValue("about", event.target.value)} onBlur={() => handleFieldBlur("about")} rows={1} className="w-full rounded-lg border border-[#eedddd] bg-white px-3 py-2 text-sm leading-6 text-[#403537] outline-none focus:border-[#c96f73]" placeholder="Tell us about your pet’s personality, favorite activities, temperament, and daily habits..." />
                      <div className="flex justify-end text-[11px] text-[#9f8e8f]">{form.about.length} / 2000</div>
                    </FieldGroup>
                  </section>

                  <section className="rounded-2xl border border-[#f0dada] bg-white p-3 shadow-[0_2px_10px_rgba(117,55,59,0.03)] sm:p-4">
                    <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-[#a63842]">
                      <span aria-hidden="true">✚</span>
                      Medications &amp; Health Notes
                    </h2>
                    <p className="mb-4 text-xs leading-5 text-[#857a7d]">Record medications, dosages, allergies, or ongoing conditions. Leave this blank if it does not apply.</p>
                    <FieldGroup error={errors.medications}>
                      <textarea aria-label="Medications and Health Notes" value={form.medications} onChange={(event) => setValue("medications", event.target.value)} onBlur={() => handleFieldBlur("medications")} rows={1} className="w-full rounded-lg border border-[#eedddd] bg-white px-3 py-2 text-sm leading-6 text-[#403537] outline-none placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. No chronic medications. Occasional monthly flea and tick preventative..." />
                      <div className="flex justify-end text-[11px] text-[#9f8e8f]">{form.medications.length} / 500</div>
                    </FieldGroup>
                  </section>

                  <section className="flex flex-col rounded-2xl border border-[#f0dada] bg-white p-3 shadow-[0_2px_10px_rgba(117,55,59,0.03)] sm:p-4 lg:flex-1">
                    <h2 className="mb-4 text-lg font-semibold text-[#a63842]">Care Instructions</h2>
                    <FieldGroup error={errors.care_instructions}>
                      <textarea aria-label="Care Instructions" value={form.care_instructions} onChange={(event) => setValue("care_instructions", event.target.value)} onBlur={() => handleFieldBlur("care_instructions")} rows={1} className="w-full rounded-lg border border-[#eedddd] bg-white px-3 py-2 text-sm leading-6 text-[#403537] outline-none placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="Special care instructions, feeding schedules, preferred treats, walking routines, triggers to avoid..." />
                      <div className="flex justify-end text-[11px] text-[#9f8e8f]">{form.care_instructions.length} / 1000</div>
                    </FieldGroup>
                  </section>
                </div>

                <aside className="flex min-w-0 flex-col gap-4 lg:h-full">
                  <section className="rounded-2xl border border-[#f0dada] bg-white p-4 shadow-[0_2px_10px_rgba(117,55,59,0.03)] sm:p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#a63842]">
                      <span aria-hidden="true" className="text-sm">●</span>
                      Medical Information
                    </h2>
                    <div className="space-y-4">
                      <FieldGroup error={errors.sterilized}>
                        <FieldLabel>Sterilization Status *</FieldLabel>
                        <div className="mt-2 grid gap-2">
                          {[
                            { value: "yes", label: "Yes — Neutered/Spayed", description: "The pet has been sterilized." },
                            { value: "no", label: "No — Not sterilized", description: "The pet has not been sterilized yet." },
                            { value: "unknown", label: "Unknown", description: "Sterilization status is not known." },
                          ].map((option) => {
                            const isSelected = form.sterilized === option.value;
                            return (
                              <label key={option.value} className={isSelected ? "flex cursor-pointer items-start gap-3 rounded-xl border border-[#d96a6d] bg-[#fff3f2] p-3 shadow-[0_0_0_1px_rgba(217,106,109,0.18)]" : "flex cursor-pointer items-start gap-3 rounded-xl border border-[#e9d7d7] bg-white p-3 transition hover:border-[#d9b4b4]"}>
                                <span className={isSelected ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#c84e52] bg-[#c84e52]" : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#b9a5a5] bg-white"}>
                                  {isSelected ? <span className="size-2 rounded-full bg-white" /> : null}
                                </span>
                                <span>
                                  <span className="block text-sm font-medium text-[#30272a]">{option.label}</span>
                                  <span className="mt-0.5 block text-xs leading-5 text-[#857a7d]">{option.description}</span>
                                </span>
                                <input type="radio" name="sterilized" value={option.value} checked={isSelected} onChange={() => setValue("sterilized", option.value)} onBlur={() => handleFieldBlur("sterilized")} className="sr-only" />
                              </label>
                            );
                          })}
                        </div>
                      </FieldGroup>

                      <FieldGroup error={errors.last_dental_check}>
                        <FieldLabel>Last Dental / Vaccination</FieldLabel>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#a63842]">
                            <CalendarIcon />
                          </span>
                          <input type="date" max={todayDateValue} value={form.last_dental_check} onChange={(event) => setValue("last_dental_check", event.target.value)} onBlur={() => handleFieldBlur("last_dental_check")} className="h-10 w-full rounded-lg border border-[#eedddd] bg-white pl-9 pr-3 text-sm text-[#403537] outline-none focus:border-[#c96f73]" />
                        </div>
                      </FieldGroup>
                      <div className="flex items-start gap-3 rounded-xl border border-[#f0e5e6] bg-[#fffafa] p-3 text-xs leading-5 text-[#857a7d]">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#a63842]">
                          <path d="M12 3 5.5 5.5v5.3c0 4.3 2.8 8.2 6.5 10.2 3.7-2 6.5-5.9 6.5-10.2V5.5L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        </svg>
                        <p>Medical details help vetted sitters provide safe, personalized care and administer correct medication on schedule.</p>
                      </div>
                    </div>
                  </section>

                  <section className="flex flex-col rounded-2xl border border-[#f0dada] bg-white p-4 shadow-[0_2px_10px_rgba(117,55,59,0.03)] sm:p-5 lg:flex-1">
                    <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-[#a63842]">
                      <span aria-hidden="true">✚</span>
                      Vaccination &amp; Medical Records <span className="ml-auto text-[11px] font-normal text-[#9f8e8f]">Optional</span>
                    </h2>
                    <p className="mb-4 text-xs leading-5 text-[#857a7d]">Upload a medical document if you have one. Uploading a file does not verify vaccination status.</p>
                    <FieldGroup error={errors.medical_report}>
                      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#e8c7c7] bg-[#fffafa] px-4 py-5 text-center text-[#a63842] transition hover:border-[#c96f73] hover:bg-[#fff7f7]">
                        <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#fff0ef]">
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
                            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v4h14v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-sm font-semibold">Click to upload a medical record</span>
                        <span className="mt-1 text-xs text-[#857a7d]">JPEG, PNG, WEBP, GIF, BMP, or PDF up to 10 MB</span>
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={handleMedicalReportChange} />
                      </label>
                      {medicalReportFile ? (
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#f0dede] bg-white p-3">
                          {medicalReportFile.type.startsWith("image/") && medicalReportPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={medicalReportPreview} alt="Selected medical document preview" className="size-16 shrink-0 rounded-md border border-[#f0dede] object-contain" />
                          ) : (
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-[#fff1f1] text-xs font-semibold text-[#a63842]">PDF</span>
                          )}
                          <span className="min-w-0 flex-1 truncate text-xs text-[#5d5052]">{medicalReportFile.name}</span>
                          <span className="size-2 shrink-0 rounded-full bg-[#3caa88]" aria-label="File selected" />
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-[#8f7f80]">{form.medical_report ? form.medical_report : "No file selected yet."}</p>
                      )}
                    </FieldGroup>
                  </section>
                </aside>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#f3e5e5] pt-4 sm:flex-row sm:justify-end">
                <Link href="/owner/pets" className="inline-flex h-10 items-center justify-center rounded-lg border border-[#f0dada] bg-white px-5 text-sm font-medium text-[#705f61] transition hover:bg-[#fff7f7]">
                  Cancel
                </Link>
                <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#a63842] px-5 text-sm font-semibold text-white transition hover:bg-[#922f38] disabled:cursor-not-allowed disabled:opacity-60">
                  {isSaving ? "Saving..." : "Add My Pet"}
                </button>
              </div>
              {submitError ? <p className="pt-1 text-right text-sm font-medium text-[#c24a50]">{submitError}</p> : null}
              {saveMessage ? <p className="pt-1 text-right text-sm font-medium text-[#3caa88]">{saveMessage}</p> : null}
            </form>
          </div>
        </main>
    </div>
  );
}
