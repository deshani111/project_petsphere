"use client";

import React from "react";

type PetCardProps = {
  image?: string;
  name: string;
  type?: string;
  breed?: string;
  age?: string | number;
  onEdit?: () => void;
  onDelete?: () => void;
  onCardClick?: () => void;
  href?: string;
  variant?: "default" | "dashboard";
};

import Link from "next/link";

export default function PetCard({ image, name, type, breed, age, onEdit, onDelete, onCardClick, href, variant = "default" }: PetCardProps) {
  const isDashboardCard = variant === "dashboard";

  return (
    <article onClick={onCardClick} className={`${isDashboardCard ? "group relative flex h-full min-h-76 flex-col overflow-hidden rounded-[22px] border border-white bg-white p-2.5 shadow-[0_10px_30px_rgba(76,53,58,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(76,53,58,.14)]" : "ps-card relative flex h-full min-h-[300px] flex-col overflow-hidden p-2.5 transition hover:shadow-md"}${onCardClick ? " cursor-pointer" : ""}`}>
      <div className={`relative w-full shrink-0 overflow-hidden bg-gray-100 ${isDashboardCard ? "mb-3 aspect-[1.28/1] rounded-[17px]" : "mb-2.5 aspect-[1.35/1] rounded-lg"}`}>
        {href ? (
          <Link href={href} className="block h-full w-full">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className={`h-full w-full object-cover object-center ${isDashboardCard ? "transition duration-500 group-hover:scale-105" : ""}`} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm ps-text-muted">No image</div>
            )}
          </Link>
        ) : (
          image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className={`h-full w-full object-cover object-center ${isDashboardCard ? "transition duration-500 group-hover:scale-105" : ""}`} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm ps-text-muted">No image</div>
          )
        )}

        {isDashboardCard && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-slate-950/25 to-transparent" />}
        <div className={`absolute left-2 top-2 rounded-full bg-white/95 text-[9px] font-semibold ps-text-primary shadow-sm backdrop-blur-sm ${isDashboardCard ? "px-2.5 py-1.5" : "px-2 py-1"}`}>{type || "Pet"}</div>
      </div>

      <div className={`flex-1 px-1 ${isDashboardCard ? "mb-3" : "mb-2.5"}`}>
        <div className="flex items-center justify-between">
          {href ? (
            <Link href={href} className="hover:underline">
              <h3 className={`${isDashboardCard ? "text-[15px] tracking-tight" : "text-sm"} font-bold ps-text-default`}>{name}</h3>
            </Link>
          ) : (
            <h3 className={`${isDashboardCard ? "text-[15px] tracking-tight" : "text-sm"} font-bold ps-text-default`}>{name}</h3>
          )}
        </div>
        <p className="mt-1 text-[10px] text-slate-500">{breed || "Unknown"} · {type || "Pet"}{age ? ` · ${age}${typeof age === "number" ? " years old" : ""}` : ""}</p>
      </div>

      <div className={`mt-auto flex items-center gap-2 px-0.5 ${isDashboardCard ? "border-t border-slate-100 pt-2.5" : ""}`}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
          className={`flex min-h-8 w-1/2 items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold ps-text-primary ${isDashboardCard ? "rounded-xl bg-[#fff3f1] transition hover:bg-[#ffe5e1]" : "rounded-md bg-[var(--ps-color-primary-soft)] hover:bg-[var(--ps-color-surface-muted)]"}`}
          aria-label={`Edit ${name}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 21v-3.75L15.81 4.44a2 2 0 012.83 0l1.92 1.92a2 2 0 010 2.83L7.75 21H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Edit
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
          className={`flex min-h-8 w-1/2 items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold ps-text-danger ${isDashboardCard ? "rounded-xl bg-slate-50 text-slate-500 transition hover:bg-rose-50 hover:text-[#b24c54]" : "rounded-md bg-[var(--ps-color-danger-soft)] hover:bg-[var(--ps-color-primary-soft)]"}`}
          aria-label={`Delete ${name}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
}
