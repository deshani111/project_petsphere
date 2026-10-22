"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  FileText,
  HeartPulse,
  PawPrint,
  Pencil,
  ShieldCheck,
  Weight,
} from "lucide-react";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import { type ApiPet, getApiMessage } from "../../../../lib/pet-api";
import { parsePetNotes } from "../../../../lib/pet-notes";

type Params = {
  params: Promise<{ id: string }>;
};

function OwnerShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbf7f7] lg:flex-row">
      <OwnerSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function isImageSource(source: string) {
  return /\.(png|jpe?g|webp|gif|bmp|avif)(\?.*)?$/i.test(source);
}

function documentName(source: string) {
  try {
    const path = new URL(source, "https://petsphere.invalid").pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).at(-1) || "Health record");
  } catch {
    return "Health record";
  }
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#f0dddd] bg-white p-5 shadow-[0_3px_14px_rgba(117,55,59,0.04)] sm:p-6 ${className}`}>{children}</section>;
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <h2 className="flex items-center gap-2 text-base font-semibold text-[#3c3031]">{icon}<span>{children}</span></h2>;
}

export default function PetProfilePage({ params }: Params) {
  const [pet, setPet] = useState<ApiPet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [petId, setPetId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPet() {
      const { id } = await params;
      if (!isActive) return;

      setPetId(id);
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/pets/${encodeURIComponent(id)}`);

        if (!response.ok) {
          if (response.status === 404) throw new Error("Pet not found.");
          if (response.status === 403) throw new Error("You do not have permission to view this pet.");
          throw new Error(await getApiMessage(response));
        }

        const result: ApiPet = await response.json();
        if (isActive) setPet(result);
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : "Could not load pet.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadPet();
    return () => { isActive = false; };
  }, [params]);

  if (isLoading) {
    return <OwnerShell><div className="mx-auto max-w-6xl rounded-2xl border border-[#f0dddd] bg-white p-8 text-sm text-[#806e70]">Loading pet profile…</div></OwnerShell>;
  }
  if (error || !pet) {
    return (
      <OwnerShell>
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#f0dddd] bg-white p-8">
          <p className="font-medium text-[#48393b]">{error || "Pet not found."}</p>
          <Link href="/owner/pets" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#ad3d43] hover:underline"><ArrowLeft size={16} />Back to My Pets</Link>
        </div>
      </OwnerShell>
    );
  }

  const notes = parsePetNotes(pet.medical_notes);
  const gender = pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1).toLowerCase() : "";
  const age = pet.age == null ? "" : `${pet.age} ${pet.age === 1 ? "year" : "years"} old`;
  const subtitle = [age, pet.breed, gender].filter(Boolean).join(" · ");
  const sterilizationStatus = notes.sterilized === "yes"
    ? "Yes — Neutered / spayed"
    : notes.sterilized === "no"
      ? "No — Not sterilized"
      : notes.sterilized
        ? "Unknown"
        : "Not provided";
  const reportUrl = pet.medical_report;

  return (
    <OwnerShell>
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs text-[#947e80]">
              <Link href="/owner/pets" className="hover:text-[#a63c42]">My Pets</Link><span aria-hidden="true">›</span><span className="text-[#544244]">{pet.pet_name}</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-[#392e30] sm:text-[28px]">Pet Profile</h1>
          </div>
          <Link href={`/owner/pets/${petId}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#ad3d43] px-4 text-sm font-semibold text-white transition hover:bg-[#96353a]"><Pencil size={15} />Edit Profile</Link>
        </div>

        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="size-20 shrink-0 overflow-hidden rounded-2xl border border-[#f0dddd] bg-[#fff4f3] sm:size-[88px]">
              {pet.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pet.photo} alt={`${pet.pet_name}`} className="size-full object-cover" />
              ) : <div className="flex size-full items-center justify-center text-[#bd6266]"><PawPrint size={29} /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold leading-tight text-[#392e30]">{pet.pet_name}</h2>
                {pet.species && <span className="rounded-full bg-[#fff0ef] px-2.5 py-1 text-xs font-medium capitalize text-[#a94348]">{pet.species}</span>}
              </div>
              <p className="mt-1 text-sm text-[#806e70]">{subtitle || "Pet details"}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[#927e80]"><CalendarDays size={14} />In your family since {formatDate(pet.created_date)}</p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[#f0d9c3] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b6540]" title={reportUrl ? "A medical document is attached; vaccination status is not separately recorded." : "The pet profile does not have a verified vaccination status field."}>
              {reportUrl ? <FileText size={15} /> : <ShieldCheck size={15} />}
              {reportUrl ? "Medical record uploaded" : "Vaccination status not recorded"}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center gap-4 p-4 sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0ef] text-[#b34b50]"><Weight size={20} /></span>
            <div><p className="text-xs font-medium uppercase tracking-[0.1em] text-[#927e80]">Weight</p><p className="mt-0.5 text-xl font-bold text-[#392e30]">{pet.weight_kg ? `${pet.weight_kg} kg` : "Not provided"}</p></div>
          </Card>
          <Card className="flex items-center gap-4 p-4 sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6e9] text-[#aa743b]"><Activity size={20} /></span>
            <div><p className="text-xs font-medium uppercase tracking-[0.1em] text-[#927e80]">Last dental / vaccination date</p><p className="mt-0.5 text-base font-semibold text-[#392e30]">{notes.lastDentalVaccination || "Not recorded"}</p></div>
          </Card>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card>
              <SectionTitle icon={<HeartPulse size={17} className="text-[#b34b50]" />}>About {pet.pet_name}</SectionTitle>
              <p className="mt-4 whitespace-pre-line rounded-xl border border-[#f3e5e4] bg-[#fffafa] p-4 text-sm leading-6 text-[#635557]">{notes.about || "No details have been added for this pet yet."}</p>
            </Card>

            <Card>
              <SectionTitle icon={<FileText size={17} className="text-[#b34b50]" />}>Medications &amp; Health Notes</SectionTitle>
              <p className="mt-4 whitespace-pre-line rounded-xl border border-[#f3e5e4] bg-[#fffafa] p-4 text-sm leading-6 text-[#635557]">{notes.medications || "No medications or health notes recorded."}</p>
            </Card>

            <Card>
              <SectionTitle icon={<PawPrint size={17} className="text-[#b34b50]" />}>Care Instructions</SectionTitle>
              <p className="mt-4 whitespace-pre-line rounded-xl border border-[#f3e5e4] bg-[#fffafa] p-4 text-sm leading-6 text-[#635557]">{notes.careInstructions || "No care instructions have been added for this pet yet."}</p>
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <Card>
              <SectionTitle icon={<FileText size={17} className="text-[#b34b50]" />}>Medical Records</SectionTitle>
              <div className="mt-4 divide-y divide-[#f3e5e4] rounded-xl border border-[#f3e5e4] px-4">
                <div className="py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#947e80]">Sterilization status</p><p className="mt-1 text-sm font-medium text-[#443638]">{sterilizationStatus}</p></div>
                <div className="py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#947e80]">Last dental / vaccination date (as entered)</p><p className="mt-1 text-sm font-medium text-[#443638]">{notes.lastDentalVaccination || "Not provided"}</p></div>
              </div>

              {reportUrl ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#f0dddd] bg-[#fffafa]">
                  {isImageSource(reportUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reportUrl} alt={`Health record for ${pet.pet_name}`} className="h-64 w-full bg-white object-contain p-3" />
                  ) : (
                    <div className="flex items-center gap-3 p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0ef] text-[#b34b50]"><FileText size={19} /></span><div className="min-w-0"><p className="text-xs font-medium text-[#947e80]">Document on file</p><p className="truncate text-sm font-semibold text-[#443638]">{documentName(reportUrl)}</p></div></div>
                  )}
                  <div className="border-t border-[#f0dddd] p-3">
                    <p className="mb-2 text-sm font-semibold text-[#443638]">Health record</p>
                    <a href={reportUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#d89093] text-sm font-medium text-[#a83c42] transition hover:bg-[#fff1f0]">View full document</a>
                  </div>
                </div>
              ) : <div className="mt-4 rounded-xl border border-dashed border-[#e8cbca] bg-[#fffafa] p-5 text-center text-sm text-[#8b797b]">No medical document has been added.</div>}

              <Link href={`/owner/pets/${petId}/edit`} className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#ad3d43] px-3 text-sm font-semibold text-white transition hover:bg-[#96353a]">Upload / manage health record</Link>
            </Card>

          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
