
"use client";

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
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "PS"
  );
}

function priceLabel(sitter: SitterListing) {
  const pricedService = sitter.services.find(
    (service) =>
      Number.isFinite(service.price) && service.price > 0
  );

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
  const [failedProfileImage, setFailedProfileImage] =
    useState<string | null>(null);

  const hasReviews = sitter.reviewCount > 0 && sitter.rating > 0;

  const services = sitter.services.filter((service) =>
    service.name.trim()
  );

  const profileImage = sitter.profileImage?.trim() || null;

  const showProfileImage =
    profileImage !== null && failedProfileImage !== profileImage;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${sitter.name || "Sitter profile"}, ${
        isSelected ? "selected" : "not selected"
      }`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`ps-card grid min-w-0 cursor-pointer grid-cols-[64px_minmax(0,1fr)] gap-3 p-3 transition-all duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842] sm:grid-cols-[72px_minmax(0,1fr)_145px] sm:gap-3.5 sm:p-3.5 ${
        isSelected
          ? "border-(--ps-color-primary) bg-(--ps-color-primary-soft) shadow-[0_3px_12px_rgba(166,56,66,.14)]"
          : "hover:border-(--ps-color-primary)"
      }`}
    >
      <div className="relative size-16 overflow-hidden rounded-lg bg-(--ps-color-primary-soft) sm:size-18">
        {showProfileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImage}
            alt={`${sitter.name} profile`}
            loading="lazy"
            onError={() => setFailedProfileImage(profileImage)}
            className="size-full object-cover"
          />
        ) : (
          <div
            aria-label={`${sitter.name} initials`}
            className="grid size-full place-items-center text-lg font-semibold tracking-wide ps-text-primary"
          >
            {initialsFor(sitter.name)}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <h3 className="max-w-full wrap-break-word text-[13px] font-semibold ps-text-default">
            {sitter.name || "Name not provided"}
          </h3>

          <span
            aria-hidden="true"
            className={`grid size-4.5 shrink-0 place-items-center rounded-full border transition-colors ${
              isSelected
                ? "border-(--ps-color-primary) bg-(--ps-color-primary) text-white"
                : "border-(--ps-color-border-strong) bg-(--ps-color-surface) text-transparent"
            }`}
          >
            <Check size={11} />
          </span>

          {sitter.isVerified && (
            <span className="ps-badge ps-badge--success">
              Verified
            </span>
          )}

          <span
            className={`ps-badge ${
              sitter.isAvailable
                ? "bg-(--ps-color-primary-soft) ps-text-primary"
                : "bg-(--ps-color-surface-muted) ps-text-muted"
            }`}
          >
            {sitter.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] ps-text-muted">
          {hasReviews ? (
            <span className="inline-flex items-center gap-1">
              <Star
                size={11}
                className="fill-amber-400 text-amber-400"
              />
              {sitter.rating.toFixed(1)}
              <span>
                ({sitter.reviewCount}{" "}
                {sitter.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </span>
          ) : (
            <span>No reviews yet</span>
          )}

          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin
              size={11}
              className="shrink-0 ps-text-primary"
            />
            <span className="wrap-break-word">
              {sitter.location?.trim() || "Location not provided"}
            </span>
          </span>

          <span>
            {sitter.experienceYears}{" "}
            {sitter.experienceYears === 1 ? "year" : "years"} experience
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[10px] leading-normal ps-text-muted">
          {sitter.bio?.trim() || "Profile description not added yet."}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {services.length ? (
            services.map((service) => (
              <span
                key={service.name}
                className="ps-badge border border-(--ps-color-border) bg-(--ps-color-surface-muted) ps-text-muted"
              >
                {service.name}
              </span>
            ))
          ) : (
            <span className="text-[9px] ps-text-muted">
              Services not listed yet
            </span>
          )}
        </div>
      </div>

      <div className="col-span-2 flex items-end justify-between gap-3 border-t border-(--ps-color-border) pt-2.5 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
        <div className="sm:text-right">
          <p className="text-[8px] font-bold uppercase tracking-[.08em] ps-text-muted">
            Starting from
          </p>

          <p className="mt-1 text-xs font-semibold ps-text-default">
            {priceLabel(sitter)}
          </p>

          {sitter.services.some(
            (service) => service.price > 0
          ) && (
            <p className="mt-0.5 text-[9px] ps-text-muted">
              per{" "}
              {sitter.services.find(
                (service) => service.price > 0
              )?.unit || "service"}
            </p>
          )}
        </div>

        <span className="ps-btn ps-btn--outline min-h-8 px-3 text-[10px]">
          Profile details unavailable
        </span>
      </div>
    </article>
  );
}
