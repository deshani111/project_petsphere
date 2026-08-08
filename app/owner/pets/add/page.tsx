"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  medical_notes: string;
  sterilized: string;
  last_dental_check: string;
  medications: string;
  special_instructions: string;
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
  medical_notes: "",
  sterilized: "",
  last_dental_check: "",
  medications: "",
  special_instructions: "",
};

type FormErrors = Partial<Record<keyof AddPetForm, string>>;

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
  const [form, setForm] = useState<AddPetForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [medicalReportPreview, setMedicalReportPreview] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
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
      age: "Age is required.",
      weight_kg: "Weight is required.",
      photo: "Pet photo is required.",
      medical_report: "Medical report is required.",
      sterilized: "Please select the sterilization status.",
      special_instructions: "Special instructions are required.",
    }),
    [],
  );

  const setValue = (key: keyof AddPetForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveMessage("");
  };

  const setFileValue = (key: "photo" | "medical_report", file: File, setPreview: (value: string) => void) => {
    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);
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

    (Object.keys(validationMessages) as Array<keyof typeof validationMessages>).forEach((key) => {
      if (!String(form[key]).trim()) {
        nextErrors[key] = validationMessages[key];
      }
    });

    if (form.last_dental_check && form.last_dental_check > todayDateValue) {
      nextErrors.last_dental_check = "Please choose today or an earlier date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Temporary frontend-only verification.
    console.log("Add pet form data:", form);
    setSaveMessage("Form saved locally. Check the console for the collected data.");
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
                    <input value={form.pet_name} onChange={(event) => setValue("pet_name", event.target.value)} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none ring-0 placeholder:text-[#bdaaaa] focus:border-[#c96f73]" placeholder="e.g. Luna" />
                  </FieldGroup>

                  <FieldGroup error={errors.species}>
                    <FieldLabel>Species *</FieldLabel>
                    <select value={form.species} onChange={(event) => setValue("species", event.target.value)} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]">
                      <option value="">Select species</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                  </FieldGroup>

                  <FieldGroup error={errors.breed}>
                    <FieldLabel>Breed *</FieldLabel>
                    <input value={form.breed} onChange={(event) => setValue("breed", event.target.value)} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. Golden Retriever" />
                  </FieldGroup>

                  <FieldGroup error={errors.gender}>
                    <FieldLabel>Gender *</FieldLabel>
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

                  <FieldGroup error={errors.age}>
                    <FieldLabel>Age *</FieldLabel>
                    <input value={form.age} onChange={(event) => setValue("age", event.target.value)} inputMode="numeric" className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. 3" />
                  </FieldGroup>

                  <FieldGroup error={errors.weight_kg}>
                    <FieldLabel>Weight (kg) *</FieldLabel>
                    <input value={form.weight_kg} onChange={(event) => setValue("weight_kg", event.target.value)} inputMode="decimal" className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. 15.4" />
                  </FieldGroup>

                  <div className="sm:col-span-2">
                    <FieldGroup error={errors.medical_notes}>
                      <FieldLabel>Color / Markings</FieldLabel>
                      <input value={form.medical_notes} onChange={(event) => setValue("medical_notes", event.target.value)} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. White coat with black spots" />
                    </FieldGroup>
                  </div>
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
                    <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-[#5e5152]">
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" name="sterilized" checked={form.sterilized === "yes"} onChange={() => setValue("sterilized", "yes")} />
                        Yes, it is
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" name="sterilized" checked={form.sterilized === "no"} onChange={() => setValue("sterilized", "no")} />
                        Neutered/Spayed
                      </label>
                    </div>
                    {errors.sterilized ? <p className="mt-1 text-[11px] text-[#c24a50]">{errors.sterilized}</p> : null}
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
                        className="h-10 w-full rounded-md border border-[#eedddd] bg-white pl-9 pr-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]"
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup error={errors.medications}>
                    <FieldLabel>Medications</FieldLabel>
                    <input value={form.medications} onChange={(event) => setValue("medications", event.target.value)} className="h-10 w-full rounded-md border border-[#eedddd] bg-white px-3 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="e.g. Daily allergy tablet" />
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

                  <div className="sm:col-span-2">
                    <FieldGroup error={errors.special_instructions}>
                      <FieldLabel>Special Instructions *</FieldLabel>
                      <textarea value={form.special_instructions} onChange={(event) => setValue("special_instructions", event.target.value)} rows={4} className="mt-2 w-full rounded-md border border-[#eedddd] bg-white px-3 py-2 text-[13px] text-[#403537] outline-none focus:border-[#c96f73]" placeholder="Any important notes" />
                    </FieldGroup>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link href="/owner/pets" className="inline-flex h-10 items-center justify-center rounded-md border border-[#eedddd] bg-white px-5 text-[13px] font-medium text-[#7a6768] transition hover:bg-[#fff8f8]">
                  Cancel
                </Link>
                <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-[#b54a50] px-5 text-[13px] font-medium text-white transition hover:bg-[#a94046]">
                  Add My Pet
                </button>
              </div>
              {saveMessage ? <p className="pt-1 text-right text-[11px] font-medium text-[#3caa88]">{saveMessage}</p> : null}
            </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
