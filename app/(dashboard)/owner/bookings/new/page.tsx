"use client";

import Link from "next/link";
import BookingSummary from "./components/booking-summary";
import { useBooking, type ServiceId } from "./components/booking-context";

const services: Array<{
  id: ServiceId;
  name: string;
  description: string;
  price: string;
  unit: string;
  icon: string;
}> = [
  {
    id: "boarding",
    name: "Boarding",
    description:
      "Overnight stay in a cozy home environment with daily updates and personalized care.",
    price: "8,500.00",
    unit: "/ night",
    icon: "⌂",
  },
  {
    id: "walking",
    name: "Walking",
    description:
      "A refreshing 60-minute neighborhood walk for exercise and play to keep your pet active.",
    price: "4,000.00",
    unit: "/ hour",
    icon: "♟",
  },
  {
    id: "grooming",
    name: "Grooming",
    description:
      "Full spa treatment including bath, hair trim, and nail clipping by professional stylists.",
    price: "6,000.00",
    unit: "/ session",
    icon: "✂",
  },
  {
    id: "training",
    name: "Training",
    description:
      "Professional behavioral training sessions for all age groups and breeds to improve obedience.",
    price: "5,000.00",
    unit: "/ hour",
    icon: "◇",
  },
];

function ServiceIcon({ service }: { service: ServiceId }) {
  const shared = "h-[15px] w-[15px] fill-none stroke-current";

  if (service === "boarding") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={shared}
        strokeWidth="2"
      >
        <path d="m4 11 8-6 8 6v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8Z" />
      </svg>
    );
  }

  if (service === "walking") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={shared}
        strokeWidth="2"
      >
        <circle cx="12" cy="5" r="2" />
        <path d="m10 21 2-7-3-3 2-3 2 2 3-1m-5 5 4 7" />
      </svg>
    );
  }

  if (service === "grooming") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={shared}
        strokeWidth="2"
      >
        <circle cx="6" cy="7" r="3" />
        <circle cx="6" cy="17" r="3" />
        <path d="m8.5 9 11-5m-11 7 11 9m-11-2 6-5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={shared}
      strokeWidth="2"
    >
      <path d="m3 10 9-5 9 5-9 5-9-5Zm4 3v4c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5v-4" />
    </svg>
  );
}

export default function NewBookingPage() {
  const { draft, setDraft } = useBooking();

  const selectedService = draft.service ?? "boarding";

  const selected =
    services.find((service) => service.id === selectedService) ??
    services[0];

  return (
    <div className="booking-service-page mx-auto mt-4 grid max-w-[570px] grid-cols-1 gap-[15px] px-4 pb-6 md:grid-cols-[minmax(0,375px)_180px] md:px-0">
      <style jsx>{`
        button[aria-pressed="true"] {
          border-color: #b23f43 !important;
          box-shadow: inset 0 0 0 1px #b23f43 !important;
        }

        @media (min-width: 768px) {
          button[aria-pressed] {
            min-height: 172px !important;
          }
        }
      `}</style>

      <section className="min-w-0">
        <h1 className="m-0 text-[19px] font-bold tracking-[-.8px] md:text-[21px]">
          What service are you looking for?
        </h1>

        <p className="mb-[18px] mt-1.5 text-[9px] text-[#7c7071]">
          Select the best care option for your companion.
        </p>

        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          {services.map((service) => {
            const isSelected = service.id === selectedService;

            return (
              <button
                type="button"
                key={service.id}
                onClick={() => setDraft({ service: service.id })}
                className={`relative min-h-[145px] overflow-hidden rounded-[13px] border bg-white p-[14px] text-left text-[#292323] transition hover:border-[#A13D3F] sm:min-h-[163px] ${
                  isSelected
                    ? "border-[#A13D3F] shadow-[inset_0_0_0_1px_#A13D3F]"
                    : "border-[#e9cfcd]"
                }`}
                aria-pressed={isSelected}
              >
                <span className="absolute left-[14px] top-[14px] grid h-[27px] w-[27px] place-items-center rounded-[9px] bg-[#fae6e3] text-[#b23f43]">
                  <ServiceIcon service={service.id} />
                </span>

                <span
                  className={`absolute right-2.5 top-2.5 grid h-[15px] w-[15px] place-items-center rounded-full border text-[9px] ${
                    isSelected
                      ? "border-[#b23f43] bg-[#b23f43] text-white"
                      : "border-[#DCC0BF] bg-white text-transparent"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>

                <strong className="mt-3 block text-[11px]">
                  {service.name}
                </strong>

                <p className="my-[7px] text-[8px] leading-[1.45] text-[#675c5d]">
                  {service.description}
                </p>

                <b
                  className={`absolute bottom-[13px] text-[10px] ${
                    isSelected ? "text-[#b23f43]" : ""
                  }`}
                >
                  Rs.{service.price}
                  <em className="ml-[3px] text-[7px] font-normal not-italic text-[#6d6263]">
                    {service.unit}
                  </em>
                </b>
              </button>
            );
          })}
        </div>

        <div className="mt-[15px] flex items-center justify-between px-[18px]">
          <Link
            href="/owner/bookings"
            className="text-[9px] text-[#675c5d]"
          >
            Cancel
          </Link>

          <Link
            href="/owner/bookings/new/pet"
            className="rounded-[8px] bg-[#A13D3F] px-4 py-[9px] text-[9px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]"
          >
            Next <span className="ml-[5px] text-[13px]">→</span>
          </Link>
        </div>
      </section>

      <BookingSummary
        service={selected.name}
        price={selected.price}
        unit={selected.unit}
      />
    </div>
  );
}