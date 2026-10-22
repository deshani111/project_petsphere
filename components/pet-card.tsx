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
};

import Link from "next/link";

export default function PetCard({ image, name, type, breed, age, onEdit, onDelete, onCardClick, href }: PetCardProps) {
  return (
    <article onClick={onCardClick} className={`relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_1px_4px_rgba(15,23,42,.05)] transition hover:shadow-md${onCardClick ? " cursor-pointer" : ""}`}>
      <div className="relative mb-2.5 aspect-[1.35/1] w-full shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {href ? (
          <Link href={href} className="block h-full w-full">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="h-full w-full object-cover object-center" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[#8c7b7b]">No image</div>
            )}
          </Link>
        ) : (
          image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#8c7b7b]">No image</div>
          )
        )}

        <div className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-semibold text-[#ab3d42]">{type || "Pet"}</div>
      </div>

      <div className="mb-2.5 flex-1 px-0.5">
        <div className="flex items-center justify-between">
          {href ? (
            <Link href={href} className="hover:underline">
              <h3 className="text-[13px] font-bold text-slate-800">{name}</h3>
            </Link>
          ) : (
            <h3 className="text-[13px] font-bold text-slate-800">{name}</h3>
          )}
        </div>
        <p className="mt-1 text-[10px] text-slate-500">{breed || "Unknown"} · {type || "Pet"}{age ? ` · ${age}${typeof age === "number" ? " years old" : ""}` : ""}</p>
      </div>

      <div className="mt-auto flex items-center gap-2 px-0.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
          className="flex w-1/2 items-center justify-center gap-1 rounded-md bg-[#fff2f2] px-2 py-1.5 text-[10px] font-semibold text-[#ab3d42] hover:bg-[#fff0ef]"
          aria-label={`Edit ${name}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 21v-3.75L15.81 4.44a2 2 0 012.83 0l1.92 1.92a2 2 0 010 2.83L7.75 21H3z" stroke="#ab3d42" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Edit
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
          className="flex w-1/2 items-center justify-center gap-1 rounded-md bg-[#ffecec] px-2 py-1.5 text-[10px] font-semibold text-[#b34b4b] hover:bg-[#ffdede]"
          aria-label={`Delete ${name}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" stroke="#b34b4b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
}
