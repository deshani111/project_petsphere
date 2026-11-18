"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ratingCategories = ["Communication", "Punctuality", "Pet Care Quality"];

function Stars({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        return (
          <button
            type="button"
            key={rating}
            onClick={() => onChange(rating)}
            aria-label={`${rating} out of 5`}
            aria-checked={value === rating}
            role="radio"
            className={`text-[21px] leading-none transition ${rating <= value ? "text-[#A13D3F]" : "text-[#917d7d]"}`}
          >
            {rating <= value ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}

export default function LeaveReviewPage() {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Leave a Review | PetSphere";
  }, []);

  function updateCategoryRating(category: string, value: number) {
    setCategoryRatings((ratings) => ({ ...ratings, [category]: value }));
  }

  function submitReview() {
    setSubmitted(true);
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#fffafa] font-[Inter,Arial,sans-serif] text-[#2d2526]">

        <div className="mx-auto max-w-[850px] px-5 py-8 md:px-10 md:py-11">
          <div className="mb-4 text-center">
            <div className="relative mx-auto mb-3 grid h-[58px] w-[58px] place-items-center rounded-full border-2 border-white bg-[#d6b58e] text-[26px] shadow-[0_2px_8px_rgba(68,38,39,.12)]">👩🏻<span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-[#10a874] text-[8px] text-white">✓</span></div>
            <h1 className="m-0 text-[18px] font-bold tracking-[-.3px]">How was your experience with Sarah Mitchell?</h1>
            <p className="mb-0 mt-1 text-[9px] text-[#817576]">Boarding • Oct 24 - Oct 27, 2024</p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); submitReview(); }} className="mx-auto max-w-[560px] border border-[#f0e2e0] bg-white px-6 py-6 md:px-7">
            <div className="text-center">
              <p className="mb-2 text-[8px] font-bold uppercase tracking-[.08em] text-[#817576]">Overall Rating</p>
              <Stars value={overallRating} onChange={setOverallRating} label="Overall rating" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_138px] sm:items-center">
              <div className="grid gap-3">
                {ratingCategories.map((category) => <span key={category} className="text-[10px]">{category}</span>)}
              </div>
              <div className="grid justify-items-start gap-3">
                {ratingCategories.map((category) => <Stars key={category} value={categoryRatings[category] ?? 0} onChange={(value) => updateCategoryRating(category, value)} label={`${category} rating`} />)}
              </div>
              <div className="hidden border-l border-[#f0e2e0] pl-4 sm:block">
                <p className="mb-2 text-[9px] font-semibold">Pet Photos</p>
                <label className="grid h-[49px] cursor-pointer place-items-center rounded-[7px] border border-dashed border-[#e6c6c3] bg-[#fffafa] px-2 text-center text-[7px] text-[#66595a]">
                  <span className="text-[16px] text-[#7e6565]">▧</span>
                  <span>Add photos of your pet&apos;s stay</span>
                  <input type="file" accept="image/*" multiple className="sr-only" />
                </label>
              </div>
            </div>

            <label className="mt-6 block text-[9px] font-semibold" htmlFor="review">Your Review</label>
            <textarea id="review" value={review} onChange={(event) => setReview(event.target.value)} placeholder="Share details about your experience... Was Sarah communicative? Did your pet seem happy? Any highlights you'd like to mention?" className="mt-2 h-[62px] w-full resize-none rounded-[7px] border border-[#ead7d5] bg-[#fffafa] px-3 py-2 text-[9px] leading-[1.4] outline-none placeholder:text-[#9d9192] focus:border-[#A13D3F]" />

            <div className="mt-5 flex items-center justify-between border-t border-[#f0e2e0] pt-4">
              <button type="button" onClick={() => window.history.back()} className="text-[9px] text-[#66595a] hover:text-[#A13D3F]">Skip</button>
              <button type="submit" className="rounded-full bg-[#A13D3F] px-7 py-2.5 text-[9px] font-bold text-white shadow-[0_4px_8px_rgba(161,61,63,.18)]">{submitted ? "Review Submitted" : "Submit Review"}</button>
            </div>
            {submitted && <p className="mb-0 mt-3 text-center text-[9px] text-[#168866]" role="status">Thank you for sharing your experience.</p>}
          </form>
        </div>
    </div>
  );
}
