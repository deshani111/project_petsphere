import Link from "next/link";
import { Check } from "lucide-react";
import { confirmationBooking } from "./confirmation-data";

type BookingConfirmationProps = {
  confirmed?: boolean;
};

export default function BookingConfirmation({
  confirmed = false,
}: BookingConfirmationProps) {
  const title = confirmed ? "Booking Confirmed!" : "Booking Requested!";
  const subtitle = confirmed
    ? `Your booking with ${confirmationBooking.sitter} has been confirmed.`
    : `Your booking with ${confirmationBooking.sitter} has been requested.`;

  return (
    <main className="flex min-h-[calc(100vh-60px)] items-start justify-center bg-[#fff8f7] px-5 pb-12 pt-14 text-[#2b2323] md:pt-16">
      <section className="flex w-full max-w-[620px] flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#d9f5e9] md:h-16 md:w-16">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25b783] text-white md:h-9 md:w-9">
            <Check size={20} strokeWidth={3} />
          </span>
        </div>

        <h1 className="mb-2 mt-5 text-[28px] font-bold tracking-[-.5px] md:text-[32px]">{title}</h1>
        <p className="m-0 text-[13px] text-[#746868] md:text-[15px]">{subtitle}</p>

        <article className="mt-7 w-full max-w-[540px] rounded-[16px] bg-white px-6 py-5 text-left shadow-[0_5px_22px_rgba(68,38,39,.07)] sm:px-7 md:py-6">
          <div className="flex items-center gap-4 border-b border-[#f1e4e2] pb-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#d9c29e] text-[13px] font-bold text-[#795349] md:h-14 md:w-14">
              SM
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[10px] uppercase tracking-[.5px] text-[#b06b6c]">
                Professional sitter
              </p>
              <p className="mt-1 text-[15px] font-bold md:text-[16px]">{confirmationBooking.sitter}</p>
            </div>
            <span className="rounded-full bg-[#f8e3e0] px-3 py-2 text-[10px] text-[#9d6262]">
              {confirmationBooking.reference}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 pt-5 sm:gap-x-20">
            <div>
              <p className="m-0 text-[11px] uppercase tracking-wide text-[#9a8888]">Service</p>
              <p className="mt-1 text-[14px] md:text-[15px]">▦ {confirmationBooking.service}</p>
            </div>
            <div>
              <p className="m-0 text-[11px] uppercase tracking-wide text-[#9a8888]">Pet</p>
              <p className="mt-1 text-[14px] md:text-[15px]">♥ {confirmationBooking.pet}</p>
            </div>
            <div>
              <p className="m-0 text-[11px] uppercase tracking-wide text-[#9a8888]">Dates</p>
              <p className="mt-1 text-[14px] md:text-[15px]">{confirmationBooking.dates}</p>
            </div>
            <div>
              <p className="m-0 text-[11px] uppercase tracking-wide text-[#9a8888]">Total price</p>
              <p className="mt-1 text-[15px] font-bold text-[#a13d3f] md:text-[16px]">{confirmationBooking.totalPrice}</p>
            </div>
          </div>
        </article>

        {confirmed ? (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/owner/bookings/booking-001" className="rounded-[7px] bg-[#fbe9e7] px-4 py-3 text-[11px] text-[#746868]">
              View Booking Details
            </Link>
            <Link href="/owner/dashboard" className="rounded-[7px] bg-[#a13d3f] px-4 py-3 text-[11px] text-white">
              Go to Dashboard
            </Link>
            <Link href="/owner/checkout" className="rounded-[7px] bg-[#a13d3f] px-4 py-3 text-[11px] text-white">
              Pay Now
            </Link>
          </div>
        ) : (
          <Link href="/owner/dashboard" className="mt-5 rounded-[7px] bg-[#a13d3f] px-7 py-3 text-[12px] text-white">
            Go to Dashboard
          </Link>
        )}

        <p className="mt-7 text-[12px] text-[#9a8888]">
          {confirmed
            ? "A confirmation email with the full details has been sent to your inbox."
            : "You will be notified when the sitter accepts or declines your request"}
        </p>
      </section>
    </main>
  );
}
