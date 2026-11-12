import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  Heart,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSession } from "../../../../lib/session";

const cardClass = "rounded-xl border border-[#EEDFE1] bg-white shadow-[0_2px_8px_rgba(76,35,40,0.035)]";
const labelClass = "text-[10px] font-medium text-[#8A8790]";
const valueClass = "mt-1 break-words text-[12px] font-medium leading-relaxed text-[#252630]";

function display(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(value);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PO";
}

function SectionHeading({ icon: Icon, title, detail, action }: {
  icon: typeof UserRound;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#FFF1F2] text-[#A63842]"><Icon size={14} /></span>
        <div>
          <h2 className="text-[13px] font-semibold text-[#252630]">{title}</h2>
          {detail && <p className="mt-0.5 text-[10px] leading-relaxed text-[#85828B]">{detail}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function ComingSoonButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title={`Coming soon: ${label} is not available yet.`}
      aria-label={label}
      className="inline-flex h-8 cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-[#A63842] px-3 text-[10px] font-semibold text-white opacity-75"
    >
      {label}
    </button>
  );
}

export default async function OwnerProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "pet_owner") redirect("/");

  const userId = BigInt(session.sub);
  const [user, owner] = await Promise.all([
    prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        created_at: true,
        emailVerified: true,
      },
    }),
    prisma.pet_owner.findUnique({
      where: { user_id: userId },
      select: {
        address: true,
        city: true,
        emergency_contact: true,
        pet: {
          orderBy: { created_date: "desc" },
          select: {
            pet_id: true,
            pet_name: true,
            species: true,
            breed: true,
            age: true,
            photo: true,
          },
        },
      },
    }),
  ]);

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Pet Owner";
  const pets = owner?.pet ?? [];
  const emailVerified = Boolean(user?.emailVerified);

  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-295">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-bold tracking-tight text-[#252630] sm:text-2xl">My Profile</h1>
              <ComingSoonButton label="Edit Profile" />
            </div>

            <section className={`${cardClass} mb-4 p-4 sm:p-5`} aria-label="Profile overview">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid size-17 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F8E8E9] text-lg font-bold text-[#A63842] ring-1 ring-[#EEDFE1]">
                    {initials(fullName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-[#252630]">{fullName}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F1F3] px-2 py-1 text-[9px] font-semibold text-[#6F6E78]"><PawPrint size={11} /> Pet Owner</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${emailVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {emailVerified ? <BadgeCheck size={11} /> : <CircleHelp size={11} />}
                        {emailVerified ? "Email verified" : "Email not verified"}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6F6E78]">
                      <span className="inline-flex items-center gap-1.5"><Mail size={12} />{display(user?.email)}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin size={12} />{display(owner?.city)}</span>
                    </p>
                    <p className="mt-2 text-[10px] text-[#8A8790]">Member since {formatDate(user?.created_at)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 md:min-w-62.5">
                  <div className="rounded-lg bg-[#FFF8F8] p-3 text-center">
                    <p className="text-lg font-bold leading-none text-[#A63842]">{pets.length}</p>
                    <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide text-[#77747D]">Registered pets</p>
                  </div>
                  <div className="rounded-lg bg-[#FFF8F8] p-3 text-center">
                    <p className="text-sm font-bold leading-5 text-[#252630]">{emailVerified ? "Verified" : "Pending"}</p>
                    <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-[#77747D]">Email status</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
                <section className={`${cardClass} p-4 sm:p-5 lg:col-start-1 lg:row-start-1`}>
                  <SectionHeading
                    icon={UserRound}
                    title="Personal Information"
                    action={<ComingSoonButton label="Edit Details" />}
                  />
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div><dt className={labelClass}>Full name</dt><dd className={valueClass}>{fullName}</dd></div>
                    <div><dt className={labelClass}>Email address</dt><dd className={valueClass}>{display(user?.email)}</dd></div>
                    <div><dt className={labelClass}>Phone number</dt><dd className={valueClass}>{display(user?.phone_number)}</dd></div>
                    <div><dt className={labelClass}>City / Region</dt><dd className={valueClass}>{display(owner?.city)}</dd></div>
                    <div className="sm:col-span-2"><dt className={labelClass}>Residential address</dt><dd className={valueClass}>{display(owner?.address)}</dd></div>
                    <div className="sm:col-span-2 rounded-lg bg-[#FFF8F8] p-3"><dt className={labelClass}>About me</dt><dd className={valueClass}>Not available</dd></div>
                  </dl>
                </section>

                <section className={`${cardClass} p-4 sm:p-5 lg:col-start-1 lg:row-start-2`}>
                  <SectionHeading
                    icon={Phone}
                    title="Emergency Contact"
                    detail="Saved emergency contact information"
                    action={<ComingSoonButton label="Update" />}
                  />
                  <div className="rounded-lg border border-[#F1E7E8] bg-[#FFFCFC] p-3">
                    <p className={labelClass}>Emergency contact</p>
                    <p className={valueClass}>{display(owner?.emergency_contact)}</p>
                  </div>
                </section>
                <section className={`${cardClass} p-4 sm:p-5 lg:col-start-2 lg:row-start-1`}>
                  <SectionHeading
                    icon={Heart}
                    title="My Pet Family"
                    detail={`${pets.length} ${pets.length === 1 ? "companion" : "companions"}`}
                    action={<Link href="/owner/pets" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#A63842] hover:underline">View My Pets <ChevronRight size={12} /></Link>}
                  />
                  {pets.length ? (
                    <div className="space-y-2">
                      {pets.slice(0, 4).map((pet) => (
                        <Link key={pet.pet_id.toString()} href={`/owner/pets/${pet.pet_id.toString()}`} className="group flex min-w-0 items-center gap-3 rounded-lg border border-[#F0E6E7] bg-white p-2.5 transition hover:border-[#D9B8BB] hover:bg-[#FFFCFC]">
                          <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#FFF1F2] text-[#A63842]">
                            {pet.photo ? <Image src={pet.photo} alt="" fill unoptimized sizes="40px" className="object-cover" /> : <PawPrint size={17} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-semibold text-[#252630]">{pet.pet_name}</span>
                            <span className="mt-0.5 block truncate text-[9px] text-[#77747D]">
                              {[pet.species || "Pet", pet.breed, pet.age == null ? null : `${pet.age} ${pet.age === 1 ? "year" : "years"} old`].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <ChevronRight size={14} className="shrink-0 text-[#AAA5AC] transition group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                      {pets.length > 4 && <p className="px-1 pt-1 text-[10px] text-[#77747D]">And {pets.length - 4} more. <Link href="/owner/pets" className="font-semibold text-[#A63842] hover:underline">See all pets</Link></p>}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#E8D7D9] bg-[#FFFCFC] px-4 py-5 text-center">
                      <PawPrint size={20} className="mx-auto text-[#B9868A]" />
                      <p className="mt-2 text-[11px] font-semibold text-[#45434A]">No pets registered yet</p>
                      <p className="mt-1 text-[10px] text-[#85828B]">Add a pet to start building your family profile.</p>
                    </div>
                  )}
                  <Link href="/owner/pets/add" className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#DABFC2] text-[10px] font-semibold text-[#A63842] transition hover:bg-[#FFF8F8]"><Plus size={13} /> Add Another Pet</Link>
                </section>

                <section className={`${cardClass} p-4 sm:p-5 lg:col-start-2 lg:row-start-2`}>
                  <SectionHeading icon={AlertCircle} title="Preferences & Alerts" detail="Notification preferences are not configured yet." />
                  <div className="space-y-3">
                    {[
                      ["Booking updates & check-ins", "SMS and push alerts for activity on your bookings."],
                      ["Caregiver messages", "Get notified when a caregiver sends you a message."],
                      ["Newsletter & seasonal care tips", "Pet health guidance and platform updates."],
                    ].map(([title, description]) => (
                      <div key={title} className="flex items-center justify-between gap-3 rounded-lg bg-[#FFFCFC] px-3 py-2.5">
                        <div><p className="text-[10px] font-semibold text-[#45434A]">{title}</p><p className="mt-0.5 text-[9px] leading-relaxed text-[#8A8790]">{description}</p></div>
                        <button type="button" disabled aria-label={`${title}: unavailable`} title="Notification preferences are not configured yet." className="relative h-4.5 w-9 shrink-0 cursor-not-allowed rounded-full bg-[#DEDADD] opacity-70"><span className="absolute left-0.5 top-0.5 size-3.5 rounded-full bg-white shadow-sm" /></button>
                      </div>
                    ))}
                  </div>
                </section>
            </div>

            <section className={`${cardClass} mt-4 p-4 sm:p-5`}>
              <SectionHeading
                icon={ShieldCheck}
                title="Identity Verification"
                detail="Identity verification documents are not available for owner accounts."
                action={<span className="inline-flex items-center gap-1 rounded-full bg-[#F3F1F3] px-2.5 py-1 text-[9px] font-semibold text-[#77747D]"><CircleHelp size={11} /> Not available</span>}
              />
              <div className="grid gap-2 sm:grid-cols-3">
                {["NIC Front", "NIC Back", "Selfie Holding NIC"].map((document) => (
                  <div key={document} className="flex min-h-15.5 items-center gap-2.5 rounded-lg bg-[#F8F7F8] px-3 py-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white text-[#85828B]"><FileCheck2 size={14} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-[#45434A]">{document}</span><span className="mt-0.5 block text-[9px] text-[#8A8790]">Not available</span></span>
                    <CircleHelp size={13} className="text-[#AAA5AC]" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F1E7E8] bg-[#FFFCFC] px-3 py-2.5">
                <p className="flex max-w-3xl items-start gap-2 text-[9px] leading-relaxed text-[#77747D]"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#A63842]" />Identity documents are not stored for owner accounts. Email verification confirms your email address only; it does not verify your identity.</p>
                <ComingSoonButton label="Manage Documents" />
              </div>
            </section>
          </div>
    </main>
  );
}
