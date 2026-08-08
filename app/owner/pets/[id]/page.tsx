import React from "react";
import { DashboardHeader } from "../../../../components/owner-dashboard/dashboard-header";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import Link from "next/link";
import { pets as samplePets } from "../../../../lib/owner-dashboard-data";

const pageColors = {
  pageBg: "bg-[#fff8f7]",
  shellBorder: "border-[#f3dfdf]",
  cardBorder: "border-[#f0e3e3]",
  cardBg: "bg-white",
  heading: "text-[#3f3436]",
  subtext: "text-[#7f7072]",
  muted: "text-[#8b7d7e]",
  rose: "text-[#bf494f]",
  roseBg: "bg-[#fff2f2]",
  mint: "text-[#3caa88]",
  mintBg: "bg-[#edf9f4]",
  careBg: "bg-[#fffdfd]",
};

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

function getPetProfileCopy(name: string, breed: string) {
  const copy: Record<string, { about: string; care: string; recordDate: string }> = {
    Cooper: {
      about: "Cooper is a calm and affectionate Golden Retriever with a warm, loyal personality. He loves being around people, greets everyone with a happy tail and bright energy, and enjoys morning walks, gentle play sessions, and relaxing near his family after an active day.",
      care: "Cooper needs regular exercise, clean water, and a balanced diet suited to his active lifestyle. He should be brushed often, checked for ear cleanliness, and kept on a consistent vaccination schedule to stay healthy.",
      recordDate: "Last updated: May 18, 2025",
    },
    Luna: {
      about: "Luna is a vibrant and energetic Samoyed who embodies the Sammie Smile. She is exceptionally friendly toward both humans and other dogs, her joyful personality lights up every room, and her favorite activities include long morning runs, playful fetch sessions, and plenty of cuddles after a busy day.",
      care: "Luna requires specific care to stay healthy and happy. Because she has strict allergies, her meals should avoid chicken and poultry-based treats. Her monthly heartworm preventive should be kept up to date, and she needs a quiet, indoor resting area with a calming bed after active outings.",
      recordDate: "Last updated: May 14, 2025",
    },
    Misty: {
      about: "Misty is a curious Domestic Shorthair with a playful and observant nature. She loves finding sunny spots, watching the world from windows, following familiar people around the house, and settling into a steady routine once she feels comfortable and safe.",
      care: "Misty does best with a predictable feeding routine, fresh water, and a quiet litter area. Regular grooming, scratching posts, and indoor play keep her content and help support her wellbeing.",
      recordDate: "Last updated: June 2, 2025",
    },
    Shenu: {
      about: "Shenu is a spirited Samoyed with a fluffy coat and a confident, cheerful personality. She loves movement, attention, and being part of daily family life, and she is happiest when she has room to run, explore, and return to her people for praise and affection.",
      care: "Shenu needs regular brushing, outdoor exercise, and a clean, well-ventilated resting space. Her diet should stay consistent, and her vaccinations should remain current with routine wellness checks.",
      recordDate: "Last updated: April 29, 2025",
    },
    Brownie: {
      about: "Brownie is a cheerful French Bulldog with a friendly attitude and a compact, sturdy build. He is affectionate, people-oriented, very happy spending time close to his family, and enjoys short walks, soft beds, and easygoing playtime that make him a fun and lovable companion.",
      care: "Brownie should be kept cool in warm weather, monitored for breathing comfort, and fed a balanced diet to maintain a healthy weight. Gentle exercise and routine vet checks are important for his care.",
      recordDate: "Last updated: March 11, 2025",
    },
    Sheba: {
      about: "Sheba is a graceful Siamese cat with a curious, vocal, and intelligent nature. She enjoys being involved in everything, has a strong bond with familiar people, and is happiest when she has both playtime and quiet moments to observe her surroundings.",
      care: "Sheba benefits from interactive play, a steady feeding schedule, and a calm indoor environment. Regular grooming, clean water, and routine preventive care help her stay balanced and healthy.",
      recordDate: "Last updated: May 7, 2025",
    },
  };

  return (
    copy[name] || {
      about: `${name} is a lovely ${breed} with a gentle temperament and a personality that makes daily care rewarding. ${name} enjoys routine, attention, and comfortable resting spaces, and adapts well when surrounded by familiar people and calm surroundings.`,
      care: `${name} should have consistent meals, fresh water, regular vet checks, and a clean resting area. Adjust exercise, grooming, and dietary needs based on breed and age.`,
      recordDate: "Last updated: May 1, 2025",
    }
  );
}

function createVaccinationPreview(petName: string, breed: string, recordDate: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 720 520">
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f6f4ef"/>
          <stop offset="100%" stop-color="#f0ebe5"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#c88c8c" flood-opacity="0.12"/>
        </filter>
      </defs>
      <rect width="720" height="520" rx="28" fill="#fffaf9"/>
      <rect x="28" y="24" width="664" height="472" rx="20" fill="url(#paper)" stroke="#dccfc8" filter="url(#shadow)"/>

      <text x="360" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" fill="#c14f4f">VACCINATION RECORD</text>

      <rect x="66" y="92" width="588" height="316" rx="2" fill="#f7f5ee" stroke="#a7a39a" stroke-width="1.2"/>
      <line x1="66" y1="146" x2="654" y2="146" stroke="#a7a39a" stroke-width="1"/>
      <line x1="66" y1="218" x2="654" y2="218" stroke="#a7a39a" stroke-width="1"/>
      <line x1="66" y1="290" x2="654" y2="290" stroke="#a7a39a" stroke-width="1"/>
      <line x1="66" y1="362" x2="654" y2="362" stroke="#a7a39a" stroke-width="1"/>
      <line x1="180" y1="92" x2="180" y2="408" stroke="#a7a39a" stroke-width="1"/>
      <line x1="414" y1="92" x2="414" y2="408" stroke="#a7a39a" stroke-width="1"/>
      <line x1="540" y1="92" x2="540" y2="408" stroke="#a7a39a" stroke-width="1"/>

      <text x="92" y="126" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#5a5f4f">DATE</text>
      <text x="216" y="126" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#5a5f4f">VACCINATION USED &amp;</text>
      <text x="216" y="145" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#5a5f4f">BATCH NO.</text>
      <text x="440" y="126" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#5a5f4f">NEXT DUE</text>
      <text x="554" y="126" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#5a5f4f">STAMP &amp; SIGNATURE</text>

      <text x="90" y="190" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#3f4f6b">29/9/2023</text>
      <text x="90" y="262" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#3f4f6b">12/10/2023</text>
      <text x="90" y="334" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#3f4f6b">13/11/23</text>
      <text x="90" y="406" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#3f4f6b">13/11/23</text>

      <rect x="202" y="160" width="120" height="34" rx="6" fill="#efe7df"/>
      <rect x="202" y="232" width="120" height="34" rx="6" fill="#efe7df"/>
      <rect x="202" y="304" width="120" height="34" rx="6" fill="#efe7df"/>
      <rect x="202" y="376" width="120" height="18" rx="3" fill="#efe7df"/>
      <text x="210" y="181" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#5b534b">Parvovirus Vaccine</text>
      <text x="210" y="253" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#5b534b">Parvovirus Vaccine</text>
      <text x="210" y="325" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#5b534b">DHLPPi</text>
      <text x="210" y="389" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#5b534b">Bioscan DHLPPi</text>

      <rect x="264" y="156" width="46" height="54" rx="10" fill="#101010"/>
      <rect x="264" y="228" width="46" height="54" rx="10" fill="#101010"/>
      <rect x="264" y="300" width="46" height="32" rx="8" fill="#101010"/>
      <rect x="264" y="372" width="46" height="26" rx="6" fill="#f2c16d"/>
      <rect x="310" y="156" width="18" height="54" rx="6" fill="#121212"/>
      <rect x="310" y="228" width="18" height="54" rx="6" fill="#121212"/>
      <rect x="310" y="300" width="18" height="32" rx="4" fill="#121212"/>
      <rect x="310" y="372" width="18" height="26" rx="4" fill="#7d4c19"/>

      <text x="445" y="190" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#413f73">12/10/2023</text>
      <text x="445" y="262" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#413f73">13/11/2023</text>
      <text x="445" y="334" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#413f73">13/11/2024</text>
      <text x="445" y="406" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#413f73">13/11/2024</text>

      <g transform="translate(574 106) rotate(90)">
        <rect x="0" y="0" width="170" height="46" rx="8" fill="none" stroke="#1459b1" stroke-width="3"/>
        <text x="12" y="18" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#1459b1">SUPERIOR ANIMAL CLINIC</text>
        <text x="12" y="35" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#1459b1">Tel: +94 77 009 4190</text>
      </g>
      <g transform="translate(552 282) rotate(18)">
        <rect x="0" y="0" width="160" height="48" rx="8" fill="none" stroke="#1459b1" stroke-width="3"/>
        <text x="14" y="19" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#1459b1">SUPERIOR ANIMAL CLINIC</text>
        <text x="14" y="36" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#1459b1">signature &amp; stamp</text>
      </g>
      <g transform="translate(548 354) rotate(14)">
        <rect x="0" y="0" width="130" height="46" rx="8" fill="none" stroke="#1459b1" stroke-width="3"/>
        <text x="12" y="19" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#1459b1">SUPERIOR CLINIC</text>
        <text x="12" y="34" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#1459b1">vaccination stamp</text>
      </g>

      <text x="92" y="446" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#6e625d">{petName} • {breed}</text>
      <text x="92" y="468" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#8c7d7e">{recordDate}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const extraPets = [
  {
    id: 4,
    name: "Shenu",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=700&q=85",
    details: "Samoyed • 4 Years Old",
  },
  {
    id: 5,
    name: "Brownie",
    image:
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=700&q=85",
    details: "French Bulldog • 2 Years Old",
  },
  {
    id: 6,
    name: "Sheba",
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=700&q=85",
    details: "Siamese • 3 Years Old",
  },
];

type Params = { params: { id: string } };

export default function PetProfilePage({ params }: Params) {
  const all = [
    ...samplePets.map((p) => ({ id: p.id, name: p.name, image: p.image, details: p.details })),
    ...extraPets,
  ];

  const id = Number(params.id);
  const pet = all.find((x) => x.id === id);

  if (!pet) {
    return (
      <div className="min-h-screen flex bg-[#fff8f7]">
        <OwnerSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <div className="m-8">Pet not found.</div>
        </div>
      </div>
    );
  }

  const { type, breed, age } = parseDetails(pet.details, pet.name);
  const profileCopy = getPetProfileCopy(pet.name, breed);
  const vaccinationPreview = createVaccinationPreview(pet.name, breed, profileCopy.recordDate);

  return (
    <div className={`min-h-screen flex ${pageColors.pageBg}`}>
      <OwnerSidebar />
      <div className="flex-1">
        <DashboardHeader />

        <main className="w-full px-4 py-7 sm:px-5 sm:py-9 lg:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className={`page-title ${pageColors.heading}`}>Pet Profile</h1>
              <p className={`page-subtitle mt-1 ${pageColors.muted}`}>Everything you need to know about your furry companion, all in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/owner/pets" className={`rounded-md border ${pageColors.cardBorder} bg-white px-4 py-2 text-[#6f5f5f]`}>Back to pets</Link>
              <Link href={`/owner/pets/${pet.id}/edit`} className="rounded-md bg-[#b8454a] px-4 py-2 text-white shadow-sm">Edit Profile</Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className={`rounded-[20px] border ${pageColors.shellBorder} ${pageColors.cardBg} p-6 shadow-[0_1px_0_rgba(255,255,255,0.9)]`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-6">
                  <div className="h-28 w-28 overflow-hidden rounded-xl bg-[#f7f0ef] shadow-[0_8px_20px_rgba(176,114,114,0.14)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h2 className={`text-[28px] font-bold leading-none ${pageColors.heading}`}>{pet.name}</h2>
                    <p className={`mt-3 text-[17px] ${pageColors.subtext}`}>{age} • {breed} • {type}</p>
                    <div className="mt-3 flex gap-3">
                      <span className={`inline-flex items-center gap-2 rounded-md ${pageColors.roseBg} px-3 py-1 text-sm ${pageColors.rose}`}>WYC, Colombo 07</span>
                      <span className={`inline-flex items-center gap-2 rounded-md ${pageColors.mintBg} px-3 py-1 text-sm ${pageColors.mint}`}>Member since 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={`rounded-2xl border ${pageColors.cardBorder} bg-white p-5`}>
                <h4 className="text-[11px] font-semibold tracking-[0.08em] text-[#8a7b7c]">WEIGHT</h4>
                <div className="mt-2 text-[26px] font-bold text-[#3f3436]">15.4 kg</div>
              </div>
              <div className={`rounded-2xl border ${pageColors.cardBorder} bg-white p-5`}>
                <h4 className="text-[11px] font-semibold tracking-[0.08em] text-[#8a7b7c]">VACCINATION STATUS</h4>
                <div className="mt-2 text-[22px] font-semibold text-[#15a266]">Vaccinated</div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <div className={`rounded-2xl border ${pageColors.cardBorder} bg-white p-6`}>
                  <h3 className={`flex items-center gap-2 text-[15px] font-semibold ${pageColors.heading}`}>
                    <span className="text-[#c64f55]">ⓘ</span>
                    About {pet.name}
                  </h3>
                  <p className={`mt-3 text-[15px] leading-7 ${pageColors.subtext}`}>{profileCopy.about}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`rounded-full ${pageColors.roseBg} px-3 py-1 text-[11px] ${pageColors.rose}`}>Great with Kids</span>
                    <span className={`rounded-full ${pageColors.roseBg} px-3 py-1 text-[11px] ${pageColors.rose}`}>Park Lover</span>
                    <span className={`rounded-full ${pageColors.roseBg} px-3 py-1 text-[11px] ${pageColors.rose}`}>Friendly</span>
                    <span className={`rounded-full ${pageColors.roseBg} px-3 py-1 text-[11px] ${pageColors.rose}`}>Active</span>
                  </div>
                </div>

                <div className={`rounded-2xl border ${pageColors.cardBorder} ${pageColors.cardBg} p-6`}>
                  <h3 className={`flex items-center gap-2 text-[15px] font-semibold ${pageColors.heading}`}>
                    <span className="text-[#c64f55]">◌</span>
                    Care Instructions
                  </h3>
                  <div className={`mt-4 rounded-2xl border ${pageColors.cardBorder} ${pageColors.careBg} p-5`}>
                    <p className={`text-[15px] leading-7 ${pageColors.subtext}`}>{profileCopy.care}</p>
                  </div>
                </div>
              </div>

              <aside className="md:col-span-1">
                <div className={`rounded-2xl border ${pageColors.cardBorder} bg-white p-6`}>
                  <h3 className={`flex items-center gap-2 text-[15px] font-semibold ${pageColors.rose}`}>
                    <span>🗂</span>
                    Vaccination Records
                  </h3>
                  <div className="mt-4 rounded-[18px] border border-dashed border-[#f4dede] bg-[#fffdfd] p-4">
                    <div className="overflow-hidden rounded-[10px] bg-[#f8f2ef] p-3 shadow-[inset_0_0_0_1px_rgba(192,110,110,0.05)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={vaccinationPreview} alt="Pet vaccination record" className="h-52 w-full rounded-[8px] object-cover" />
                    </div>
                    <div className="mt-3 text-[13px] font-medium text-[#3f3436]">Official Pet Vaccination Record</div>
                    <div className="mt-1 text-[11px] text-[#8c7d7e]">{profileCopy.recordDate}</div>
                    <div className="mt-3">
                      <button type="button" className="rounded-md border border-[#f0c9c9] bg-[#fff9f9] px-3 py-2 text-[13px] font-medium text-[#bf4a50]">View Full Document</button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
