import { notFound } from "next/navigation";
import { loadOwnerBookingDetails } from "../owner-booking-details";
import BookingConfirmation from "../booking-confirmation";

export const metadata = {
  title: "Booking Confirmation | PetSphere",
};

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ bookingId?: string | string[] }> }) {
  const { bookingId } = await searchParams;
  if (bookingId === undefined) return <BookingConfirmation confirmed />;
  if (typeof bookingId !== "string") notFound();
  const details = await loadOwnerBookingDetails(bookingId);
  if (!details) notFound();
  return <BookingConfirmation confirmed={["Confirmed", "In Progress", "Completed"].includes(details.booking.status)} bookingId={bookingId} booking={details.booking} hasSitter={details.hasSitter} />;
}
