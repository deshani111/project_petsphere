import { useState } from "react";
import { Check, MapPin, Star } from "lucide-react";
import type { ApprovedPublicMapLocation } from "../../../../lib/sitters/public-map-location";

export type SitterListing = {
  id: string;
  name: string;
  profileImage: string | null;
  serviceArea: string | null;
  publicMapLocation: ApprovedPublicMapLocation | null;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  bio: string | null;
  location: string | null;
  experienceYears: number;
  services: Array<{ name: string; price: number; unit: string }>;
};

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PS";
}

function priceLabel(sitter: SitterListing) {
  const pricedService = sitter.services.find((service) => Number.isFinite(service.price) && service.price > 0);
  if (!pricedService) return "Pricing not available";
  return `Rs. ${pricedService.price.toLocaleString("en-LK")}`;
}

export function SitterCard({
  sitter,
  isSelected,
  onSelect,
}: {
  sitter: SitterListing;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [failedProfileImage, setFailedProfileImage] = useState<string | null>(null);
  const hasReviews = sitter.reviewCount > 0 && sitter.rating > 0;
  const services = sitter.services.filter((service) => service.name.trim());
  const profileImage = sitter.profileImage?.trim() || null;
  const showProfileImage = profileImage !== null && failedProfileImage !== profileImage;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${sitter.name || "Sitter profile"}, ${isSelected ? "selected" : "not selected"}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`grid min-w-0 cursor-pointer grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border p-3 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842] sm:grid-cols-[72px_minmax(0,1fr)_145px] sm:gap-3.5 sm:p-3.5 ${isSelected ? "border-[#A63842] bg-[#FFF1F2] shadow-[0_3px_12px_rgba(166,56,66,.14)]" : "border-[#EEDFE1] bg-white shadow-[0_2px_9px_rgba(37,38,48,.035)] hover:border-[#A63842]/45"}`}
    >
      <div className="relative size-16 overflow-hidden rounded-lg bg-[#FFF1F2] sm:size-[72px]">
        {showProfileImage ? (
          // Profile images are user-provided URLs, so use a regular img without remote-host config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profileImage} alt={`${sitter.name} profile`} loading="lazy" onError={() => setFailedProfileImage(profileImage)} className="size-full object-cover" />
        ) : (
          <div aria-label={`${sitter.name} initials`} className="grid size-full place-items-center text-lg font-semibold tracking-wide text-[#A63842]">
            {initialsFor(sitter.name)}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <h3 className="max-w-full break-words text-[13px] font-semibold text-[#252630]">{sitter.name || "Name not provided"}</h3>
          <span aria-hidden="true" className={`grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors ${isSelected ? "border-[#A63842] bg-[#A63842] text-white" : "border-[#c9a3a6] bg-white text-transparent"}`}>
            <Check size={11} />
          </span>
          {sitter.isVerified && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">Verified</span>}
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${sitter.isAvailable ? "bg-[#FFF1F2] text-[#A63842]" : "bg-[#F3F3F5] text-[#6f6e78]"}`}>
            {sitter.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-[#6f6e78]">
          {hasReviews ? <span className="inline-flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{sitter.rating.toFixed(1)} <span>({sitter.reviewCount} {sitter.reviewCount === 1 ? "review" : "reviews"})</span></span> : <span>No reviews yet</span>}
          <span className="inline-flex min-w-0 items-center gap-1"><MapPin size={11} className="shrink-0 text-[#A63842]" /><span className="break-words">{sitter.location?.trim() || "Location not provided"}</span></span>
          <span>{sitter.experienceYears} {sitter.experienceYears === 1 ? "year" : "years"} experience</span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[10px] leading-[1.5] text-[#6f6e78]">{sitter.bio?.trim() || "Profile description not added yet."}</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {services.length ? services.map((service) => <span key={service.name} className="rounded-full border border-[#EEDFE1] bg-[#FFF9F9] px-2 py-1 text-[9px] text-[#6f6e78]">{service.name}</span>) : <span className="text-[9px] text-[#6f6e78]">Services not listed yet</span>}
        </div>
      </div>

      <div className="col-span-2 flex items-end justify-between gap-3 border-t border-[#EEDFE1] pt-2.5 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
        <div className="sm:text-right"><p className="text-[8px] font-bold uppercase tracking-[.08em] text-[#6f6e78]">Starting from</p><p className="mt-1 text-xs font-semibold text-[#252630]">{priceLabel(sitter)}</p>{sitter.services.some((service) => service.price > 0) && <p className="mt-0.5 text-[9px] text-[#6f6e78]">per {sitter.services.find((service) => service.price > 0)?.unit || "service"}</p>}</div>
        <span className="inline-flex h-8 shrink-0 items-center rounded-md border border-[#EEDFE1] px-3 text-[10px] font-semibold text-[#6f6e78]">Profile details unavailable</span>
      </div>
    </article>
  );
}
