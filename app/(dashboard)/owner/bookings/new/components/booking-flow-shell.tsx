"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

const steps = ["Service", "Pet", "Dates", "Instructions"];

export default function BookingFlowShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  const currentStep = pathname.endsWith("/pet")
    ? 1
    : pathname.endsWith("/dates")
      ? 2
      : pathname.endsWith("/instructions")
        ? 3
        : 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1200px] px-5 lg:px-8">
      <section
        className="mb-6 mt-5 rounded-2xl border border-[#efdcda] bg-white px-3 py-4 sm:px-5 sm:py-5"
        aria-label="Booking progress"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[16px] font-bold text-[#30272a] sm:text-[18px]">
            Book a Sitter
          </h2>
          <span className="shrink-0 text-[12px] font-medium text-[#887577]" aria-live="polite">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Booking progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={(currentStep + 1) * 25}
          aria-valuetext={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep]}`}
          className="h-1 overflow-hidden rounded-full bg-[#f6e5e3] sm:h-[5px]"
        >
          <div
            className="h-full rounded-full bg-[#A13D3F] transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${(currentStep + 1) * 25}%` }}
          />
        </div>

        <ol className="m-0 mt-5 grid list-none grid-cols-4 gap-1 p-0 sm:gap-3">
          {steps.map((label, index) => {
            const completed = index < currentStep;
            const active = index === currentStep;

            return (
              <li
                key={label}
                aria-current={active ? "step" : undefined}
                className="flex min-w-0 flex-col items-center gap-2 text-center"
              >
                <span
                  aria-hidden="true"
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-semibold sm:h-9 sm:w-9 sm:text-[14px] ${
                    index <= currentStep
                      ? "border-[#A13D3F] bg-[#A13D3F] text-white"
                      : "border-[#e8cecb] bg-[#fff8f7] text-[#a38b8d]"
                  } ${active ? "ring-4 ring-[#f7e5e3]" : ""}`}
                >
                  {completed ? <Check size={17} strokeWidth={2.5} /> : index + 1}
                </span>
                <span
                  className={`text-[12px] sm:text-[13px] ${
                    active
                      ? "font-bold text-[#A13D3F]"
                      : completed
                        ? "font-medium text-[#A13D3F]"
                        : "font-medium text-[#887577]"
                  }`}
                >
                  {label}
                  <span className="sr-only">
                    {completed ? ", completed" : active ? ", current step" : ", upcoming"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {children}
    </div>
  );
}
