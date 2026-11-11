import Link from "next/link";
type BookingSummaryProps = { service: string; price: string; unit: string; dateLabel?: string; nightsLabel?: string };
import { useBooking } from "./booking-context";
import { CalendarDays, ChevronRight, Heart, Home, ShieldCheck } from "lucide-react";

export default function BookingSummary({ service, price, unit, dateLabel = "Oct 12 - Oct 15", nightsLabel = "3 Nights Total" }: BookingSummaryProps) {
  const { draft } = useBooking();
  const serviceNames: Record<string, string> = { boarding: "Boarding", walking: "Walking", grooming: "Grooming", training: "Training" };
  const petNames: Record<string, string> = { charlie: "Cooper", luna: "Luna", misty: "Misty" };
  const selectedService = draft.service ? serviceNames[draft.service] : "Not selected";
  const selectedPet = draft.pet ? petNames[draft.pet] ?? draft.pet : "Not selected";
  const selectedDates = draft.startDate ? `${draft.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${draft.endDate ? ` - ${draft.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}` : "Not selected";
  const calculatedNights = draft.startDate && draft.endDate ? Math.max(1, Math.round((draft.endDate.getTime() - draft.startDate.getTime()) / 86400000)) : 0;
  const summaryItems = [
    {
      label: "SERVICE",
      value: selectedService || service,
      detail: draft.service ? `Rs. ${price} ${unit}` : "Choose a service",
      icon: Home,
      colour: "bg-[#ffe3df] text-[#A13D3F]",
    },
    {
      label: "PET",
      value: selectedPet,
      detail: draft.pet ? "Your companion" : "Choose a pet",
      icon: Heart,
      colour: "bg-[#fce9e9] text-[#A13D3F]",
    },
    {
      label: "DATES",
      value: selectedDates || dateLabel,
      detail: calculatedNights
        ? `${calculatedNights} Night${calculatedNights === 1 ? "" : "s"} Total`
        : nightsLabel,
      icon: CalendarDays,
      colour: "bg-[#d9f5e8] text-[#168866]",
    },
  ];

  return (
    <aside className="booking-summary w-full min-w-0 self-start rounded-[14px] bg-white p-5 shadow-[0_3px_18px_rgba(68,38,39,.05)]">
      <h2 className="mb-5 mt-0 text-[17px] font-bold">Booking Summary</h2>
      {summaryItems.map(({ label, value, detail, icon: Icon, colour }) => (
        <div key={label} className="mb-4 flex gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[9px] ${colour}`}>
            <Icon size={19} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="m-0 min-w-0 flex-1">
            <small className="block text-[9px] font-medium tracking-wide text-[#887d7e]">{label}</small>
            <b className="my-1 block break-words text-[13px]">{value}</b>
            <em className="block text-[10px] not-italic text-[#74696a]">{detail}</em>
          </p>
        </div>
      ))}
      <div className="mb-4 mt-5 border-t border-[#f0e3e1] pt-4 text-[11px] text-[#736767]">
        <p className="mb-3 flex justify-between gap-3"><span>Subtotal (3 nights)</span><b className="shrink-0 whitespace-nowrap text-[#564a4a]">Rs. 25,500.00</b></p>
        <p className="mb-3 flex justify-between gap-3"><span>Service Fee</span><b className="shrink-0 whitespace-nowrap text-[#564a4a]">Rs. 1,500.00</b></p>
        <p className="mt-3 flex justify-between gap-3 border-t border-[#f0e3e1] pt-3 text-[17px] font-bold text-[#A13D3F]"><span>Total</span><b className="shrink-0 whitespace-nowrap">Rs. 27,000.00</b></p>
      </div>
      <div className="rounded-[9px] border border-[#bce7d7] bg-[#e9f9f3] p-3 text-[10px] text-[#14765a]">
        <b className="flex items-center gap-1.5 text-[11px]"><ShieldCheck size={15} aria-hidden="true" /> Premium Coverage</b>
        <span className="mt-1.5 block font-bold">Included</span>
        <p className="mb-0 mt-1 leading-[1.35]">Includes 24/7 vet support and comprehensive insurance.</p>
      </div>
      <Link href="/owner/bookings/requested" className="mt-4 flex h-11 w-full items-center justify-between rounded-[8px] bg-[#A13D3F] px-3.5 text-[12px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]">
        Confirm Booking <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </aside>
  );
}
