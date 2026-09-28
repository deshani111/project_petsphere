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
    <article onClick={onCardClick} className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#f0e6e6] bg-white p-4 shadow-[0_10px_30px_rgba(91,52,51,0.06)]${onCardClick ? " cursor-pointer" : ""}`}>
      <div className="relative mb-4 h-56 w-full overflow-hidden rounded-xl bg-gray-100">
        {href ? (
          <Link href={href} className="block h-full w-full">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[#8c7b7b]">No image</div>
            )}
          </Link>
        ) : (
          image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#8c7b7b]">No image</div>
          )
        )}

        <div className="absolute left-3 top-3 rounded-full bg-[#fff8f7] px-3 py-1 text-[11px] font-semibold text-[#ab3d42]">{type || "Pet"}</div>
      </div>

      <div className="mb-4 flex-1 px-1">
        <div className="flex items-center justify-between">
          {href ? (
            <Link href={href} className="hover:underline">
              <h3 className="text-lg font-bold text-[#403537]">{name}</h3>
            </Link>
          ) : (
            <h3 className="text-lg font-bold text-[#403537]">{name}</h3>
          )}
        </div>
        <p className="mt-2 text-[13px] text-[#817374]">{breed || "Unknown"} • {type || "Pet"}</p>
      </div>

      <div className="mt-auto flex items-center gap-3 px-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
          className="flex w-1/2 items-center justify-center gap-2 rounded-lg bg-[#fff2f2] px-3 py-2 text-[13px] font-semibold text-[#ab3d42] hover:bg-[#fff0ef]"
          aria-label={`Edit ${name}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
          className="flex w-1/2 items-center justify-center gap-2 rounded-lg bg-[#ffecec] px-3 py-2 text-[13px] font-semibold text-[#b34b4b] hover:bg-[#ffdede]"
          aria-label={`Delete ${name}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" stroke="#b34b4b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
}
