"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { combinePetNotes } from "../../../../lib/pet-notes";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";

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
  form.medications
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
    <div className="min-h-screen flex bg-[#fff8f7]">
      <OwnerSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />

        <main className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-8">
          <div className="mb-4 w-full max-w-[12500px]">
            <div>
              <div className="flex items-center gap-2 text-[#4f4143]">
                <Link href="/owner/pets" className="text-[18px] font-semibold leading-none hover:text-[#ab3d42]">
                  <span aria-hidden>‹</span>
                </Link>
                <h1 className="page-title">Add New Pet</h1>
              </div>
              <p className="page-subtitle mt-1 text-[#9f8e8f]">Welcome a new furry family member by sharing their details with us.</p>
            </div>
          </div>

          <section className="w-full max-w-[1250px] rounded-[18px] border border-[#f3dede] bg-white px-5 py-7 shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:px-6">
            <form onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}>
            <div className="mb-7 flex flex-col items-center text-center">
              <label className="group flex cursor-pointer flex-col items-center gap-3">
                <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-[#e8c7c7] bg-[#fff8f7] text-[#b54a50] transition-colors group-hover:border-[#cf7c7f]">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Pet preview" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-[12px] font-semibold">Upload</div>
                      <div className="text-[10px]">Photo</div>
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-[#8f7f80]">Recommended Size: 960 x 960 px, Max 5MB</div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePetPhotoChange} />
              </label>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8f7f80]">
                <span className={`inline-flex h-2 w-2 rounded-full ${form.photo ? "bg-[#3caa88]" : "bg-[#d9b3b3]"}`} />
                <span>{form.photo ? `Uploaded: ${form.photo}` : "No pet photo uploaded yet"}</span>
              </div>
              {errors.photo ? <p className="mt-2 text-[11px] text-[#c24a50]">{errors.photo}</p> : null}
            </div>

            <div className="space-y-6">
              <div className="rounded-[16px] bg-[#fff6f6] p-4">
                <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  Basic Information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup error={errors.pet_name}>
                    <FieldLabel>Pet Name *</FieldLabel>
                    <input value={form.pet_name} onChange={(event) => setValue("pet_name", event.target.value)} onBlur={() => handleFieldBlur("pet_name")} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none ring-0 placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. Luna" />
                  </FieldGroup>

                  <FieldGroup error={errors.species}>
                    <FieldLabel>Species *</FieldLabel>
                    <select value={form.species} onChange={(event) => setValue("species", event.target.value)} onBlur={() => handleFieldBlur("species")} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]">
                      <option value="">Select species</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                  </FieldGroup>

                  <FieldGroup error={errors.breed}>
                    <FieldLabel>Breed *</FieldLabel>
                    <input value={form.breed} onChange={(event) => setValue("breed", event.target.value)} onBlur={() => handleFieldBlur("breed")} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. Golden Retriever" />
                  </FieldGroup>

                  <FieldGroup error={errors.gender}>
                    <FieldLabel>Gender *</FieldLabel>
                    <div className="grid grid-cols-2 gap-2" onBlur={() => handleFieldBlur("gender")}>
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

                  <FieldGroup error={errors.age}>
                    <FieldLabel>Age *</FieldLabel>
                    <input value={form.age} onChange={(event) => setValue("age", event.target.value)} onBlur={() => handleFieldBlur("age")} inputMode="numeric" className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. 3" />
                  </FieldGroup>

                  <FieldGroup error={errors.weight_kg}>
                    <FieldLabel>Weight (kg) *</FieldLabel>
                    <input value={form.weight_kg} onChange={(event) => setValue("weight_kg", event.target.value)} onBlur={() => handleFieldBlur("weight_kg")} inputMode="decimal" className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. 15.4" />
                  </FieldGroup>

                </div>
              </div>

              <div className="rounded-[16px] bg-[#fff6f6] p-4">
                <h2 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#b54a50]">
                  <span aria-hidden>◌</span>
                  Medical Information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel>Sterilization Status *</FieldLabel>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {[
                        {
                          value: "yes",
                          label: "Yes — Neutered/Spayed",
                          description: "The pet has been sterilized (neutered for male, spayed for female).",
                        },
                        {
                          value: "no",
                          label: "No — Not sterilized",
                          description: "The pet has not been sterilized yet.",
                        },
                        {
                          value: "unknown",
                          label: "Unknown",
                          description: "Sterilization status is not known.",
                        },
                      ].map((option) => {
                        const isSelected = form.sterilized === option.value;

                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer flex-col rounded-xl border p-3 transition ${
                              isSelected
                                ? "border-[#d96a6d] bg-[#fff3f2] shadow-[0_0_0_1px_rgba(217,106,109,0.25)]"
                                : "border-[#e9d7d7] bg-white hover:border-[#d9b4b4]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`flex size-5 items-center justify-center rounded-full border transition ${
                                  isSelected ? "border-[#c84e52] bg-[#c84e52]" : "border-[#b9a5a5] bg-white"
                                }`}
                              >
                                {isSelected ? <span className="size-2 rounded-full bg-white" /> : null}
                              </span>
                              <span className="text-[13px] font-semibold text-[#2f2a2b]">{option.label}</span>
                            </span>
                            <span className="mt-2 pl-8 text-[12px] leading-5 text-[#7d6d6d]">{option.description}</span>
                            <input
                              type="radio"
                              name="sterilized"
                              value={option.value}
                              checked={isSelected}
                              onChange={() => setValue("sterilized", option.value)}
                              onBlur={() => handleFieldBlur("sterilized")}
                              className="sr-only"
                            />
                          </label>
                        );
                      })}
                    </div>
                    {errors.sterilized ? <p className="mt-2 text-[11px] text-[#c24a50]">{errors.sterilized}</p> : null}
                  </div>

                  <FieldGroup error={errors.last_dental_check}>
                    <FieldLabel>Last Dental / Vaccination</FieldLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#b54a50]">
                        <CalendarIcon />
                      </span>
                      <input
                        type="date"
                        max={todayDateValue}
                        value={form.last_dental_check}
                        onChange={(event) => setValue("last_dental_check", event.target.value)}
                        onBlur={() => handleFieldBlur("last_dental_check")}
                        className="h-10 w-full rounded-md border border-[#eedddd] bg-white pl-9 pr-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]"
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup error={errors.medications}>
                    <FieldLabel>Medications</FieldLabel>
                    <input value={form.medications} onChange={(event) => setValue("medications", event.target.value)} onBlur={() => handleFieldBlur("medications")} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. Daily allergy tablet" />
                  </FieldGroup>

                  <div className="sm:col-span-2">
                    <FieldLabel>Upload Medical Record / Documents</FieldLabel>
                    <label className="mt-2 flex min-h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-[#e8c7c7] bg-white px-4 py-5 text-center text-[13px] text-[#b54a50]">
                      <span>Click here or drag and drop files</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleMedicalReportChange} />
                    </label>
                    <div className="mt-3 rounded-md border border-[#f0dede] bg-white p-3 text-[11px] text-[#8f7f80]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-[#5d5052]">{form.medical_report ? form.medical_report : "No medical report uploaded yet"}</span>
                        <span className={`inline-flex h-2 w-2 rounded-full ${form.medical_report ? "bg-[#3caa88]" : "bg-[#d9b3b3]"}`} />
                      </div>
                      {medicalReportPreview ? (
                        <div className="mx-auto mt-3 w-full max-w-[240px] overflow-hidden rounded-md border border-[#f0e3e3] bg-[#fff8f7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={medicalReportPreview} alt="Medical report preview" className="h-28 w-full object-cover sm:h-24" />
                        </div>
                      ) : null}
                    </div>
                    {errors.medical_report ? <p className="mt-1 text-[11px] text-[#c24a50]">{errors.medical_report}</p> : null}
                  </div>

                  <div className="sm:col-span-2 space-y-4">
                    <FieldGroup error={errors.about}>
                      <FieldLabel>About Pet *</FieldLabel>
                      <textarea value={form.about} onChange={(event) => setValue("about", event.target.value)} onBlur={() => handleFieldBlur("about")} rows={4} className="mt-2 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="Tell us about your pet" />
                    </FieldGroup>
                    <FieldGroup error={errors.care_instructions}>
                      <FieldLabel>Care Instructions</FieldLabel>
                      <textarea value={form.care_instructions} onChange={(event) => setValue("care_instructions", event.target.value)} onBlur={() => handleFieldBlur("care_instructions")} rows={4} className="mt-2 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="Share any care instructions" />
                    </FieldGroup>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link href="/owner/pets" className="inline-flex h-10 items-center justify-center rounded-md border border-[#eedddd] bg-white px-5 text-[13px] font-medium text-[#7a6768] transition hover:bg-[#fff8f8]">
                  Cancel
                </Link>
                <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center justify-center rounded-md bg-[#b54a50] px-5 text-[13px] font-medium text-white transition hover:bg-[#a94046]">
                  {isSaving ? "Saving..." : "Add My Pet"}
                </button>
              </div>
              {submitError ? <p className="pt-1 text-right text-[11px] font-medium text-[#c24a50]">{submitError}</p> : null}
              {saveMessage ? <p className="pt-1 text-right text-[11px] font-medium text-[#3caa88]">{saveMessage}</p> : null}
            </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
