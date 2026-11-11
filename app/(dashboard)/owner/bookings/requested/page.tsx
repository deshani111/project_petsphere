import { notFound } from "next/navigation";
import { loadOwnerBookingDetails } from "../owner-booking-details";
import BookingConfirmation from "../booking-confirmation";

export const metadata = {
  title: "Booking Requested | PetSphere",
};

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ bookingId?: string | string[] }> }) {
  const { bookingId } = await searchParams;
  if (bookingId === undefined) return <BookingConfirmation />;
  if (typeof bookingId !== "string") notFound();
  const details = await loadOwnerBookingDetails(bookingId);
  if (!details) notFound();
  return <BookingConfirmation bookingId={bookingId} booking={details.booking} hasSitter={details.hasSitter} />;
}
